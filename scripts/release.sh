#!/usr/bin/env bash
# Release jupyterlab_leetcode to PyPI and npm, following the manual steps in RELEASE.md.
#
# Usage:
#   scripts/release.sh <version|major|minor|patch>   bump, build, publish, tag, push
#   scripts/release.sh --dry-run                     check, test and build the current version; publish nothing
#
# Needs the dev environment from CONTRIBUTING.md (`uv pip install --group dev -e ".[test]"`),
# a PyPI token in ~/.pypirc (or TWINE_* env vars), `npm login`, and `gh auth login`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PATH="$ROOT/.venv/bin:$PATH"

BRANCH=master
REMOTE=origin

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '4,6p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
}

[[ $# -eq 1 ]] || usage
DRY_RUN=false
BUMP=""
case "$1" in
  -h | --help) usage ;;
  --dry-run) DRY_RUN=true ;;
  -*) usage ;;
  *) BUMP="$1" ;;
esac

step "Preflight checks"
for cmd in git jlpm hatch twine npm gh python pytest; do
  command -v "$cmd" > /dev/null || die "'$cmd' not found; set up .venv as described in CONTRIBUTING.md"
done

if ! $DRY_RUN; then
  [[ "$(git branch --show-current)" == "$BRANCH" ]] || die "releases are cut from '$BRANCH'"
  [[ -z "$(git status --porcelain)" ]] || die "working tree is not clean"
  git fetch --quiet "$REMOTE" "$BRANCH"
  [[ "$(git rev-parse HEAD)" == "$(git rev-parse "$REMOTE/$BRANCH")" ]] ||
    die "'$BRANCH' is not in sync with '$REMOTE/$BRANCH'"

  npm whoami > /dev/null 2>&1 || die "not logged in to npm; run 'npm login'"
  if [[ -z "${TWINE_PASSWORD:-}" ]] && ! grep -qs '^\[pypi\]' ~/.pypirc; then
    die "no PyPI credentials; add a [pypi] token to ~/.pypirc or set TWINE_PASSWORD"
  fi
  gh auth status > /dev/null 2>&1 || die "not logged in to GitHub; run 'gh auth login'"
fi

step "Lint and test"
jlpm install --immutable
jlpm lint:check
jlpm test
pytest -q

# Until the bump is committed, undo it if anything fails.
BUMPED=false
restore_version() {
  if $BUMPED; then
    git checkout -- package.json
    echo "Reverted the version bump in package.json"
  fi
}
trap restore_version EXIT

if ! $DRY_RUN; then
  step "Bump version ($BUMP)"
  OLD_VERSION="$(hatch version)"
  BUMPED=true
  hatch version "$BUMP"
fi
VERSION="$(hatch version)"
TAG="v$VERSION"

if ! $DRY_RUN; then
  [[ "$VERSION" != "$OLD_VERSION" ]] || die "version is unchanged ($VERSION)"
  if git rev-parse -q --verify "refs/tags/$TAG" > /dev/null; then
    die "tag $TAG already exists"
  fi
fi

step "Build $VERSION"
jlpm clean:all
rm -rf dist
python -m build
twine check --strict dist/*
npm pack --dry-run

if $DRY_RUN; then
  step "Restore the development build"
  jlpm build
  step "Dry run finished: built $VERSION into dist/, nothing was published"
  exit 0
fi

echo
read -r -p "Publish $TAG to PyPI and npm, then push to $REMOTE? [y/N] " answer
[[ "$answer" == [yY] ]] || die "aborted; nothing was published"

step "Commit and tag $TAG"
git commit --quiet -m "bump version to $VERSION" -- package.json
git tag -a "$TAG" -m "$TAG"
BUMPED=false

step "Publish to PyPI"
twine upload dist/*

step "Publish to npm"
npm publish --access public

step "Push $BRANCH and $TAG"
git push --atomic "$REMOTE" "$BRANCH" "$TAG"

step "Create GitHub release"
gh release create "$TAG" --title "$TAG" --generate-notes --verify-tag

step "Restore the development build"
jlpm build

step "Released $TAG"
echo "PyPI: https://pypi.org/project/jupyterlab-leetcode/$VERSION/"
echo "npm:  https://www.npmjs.com/package/jupyterlab-leetcode/v/$VERSION"
