# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A JupyterLab 4 extension that brings LeetCode into Jupyter. It has two halves that ship together in one Python package:

- **Frontend labextension** (`src/`, TypeScript + React + Mantine). Users browse, search, and filter questions, view their profile, stats, and submission heatmap, and get a toolbar for submitting from a notebook.
- **Server extension** (`jupyterlab_leetcode/`, Python + Tornado on `jupyter_server`). It proxies every LeetCode call, generates `.ipynb` files for questions, and submits solutions.

`jlpm` is JupyterLab's pinned yarn. Use it, not npm or yarn directly.

## Commands

```bash
# Dev setup (once)
pip install -e ".[test]"
jupyter labextension develop . --overwrite
jupyter server extension enable jupyterlab_leetcode

# Build / dev loop
jlpm build                 # tsc + copy css + dev labextension build
jlpm watch                 # rebuild on change; run `jupyter lab` in another terminal
jlpm build:prod            # production build (used by hatch when packaging)

# Lint (CI runs lint:check)
jlpm lint                  # stylelint + prettier + eslint, with --fix
jlpm lint:check

# Tests
jlpm test                                   # Jest; matches src/**/__tests__/*.spec.ts(x)
jlpm jest src/__tests__/questionQuery.spec.ts   # single Jest file
jlpm jest -t 'test name'                    # single Jest test by name
pytest -vv -r ap --cov jupyterlab_leetcode  # Python server tests
pytest jupyterlab_leetcode/tests/test_handlers.py::test_get_cookies_requires_browser
```

UI integration tests (Playwright/Galata) are in `ui-tests/`. They have their own `package.json`; see `ui-tests/README.md`.

After you change Python handlers, restart `jupyter lab`. `jlpm watch` only rebuilds the frontend.

## Architecture

### Request flow and auth

The extension never asks the user to log in. Auth works through the browser's existing LeetCode cookies:

1. On the landing page, the user picks a browser (`BrowserMenu.tsx`). The frontend then calls `GET /jupyterlab-leetcode/cookies?browser=<name>`.
2. `GetCookieHandler` calls `utils.get_leetcode_cookie()`. That function uses `browser_cookie3` to read `LEETCODE_SESSION` and `csrftoken` from the local browser's cookie store. It builds LeetCode request headers and **stores them in the shared Tornado `self.settings["leetcode_headers"]`**. It also sets a `leetcode_browser` cookie on the Jupyter origin.
3. The frontend uses the `leetcode_browser` cookie (`src/utils.ts`) to decide between `LandingPage` and `LeetCodeMain`.
4. `LeetCodeHandler.prepare()` is the base for every LeetCode-calling handler. If `leetcode_headers` is missing (for example, after a server restart), it re-derives the headers from the `leetcode_browser` cookie.

All frontend → server calls go through `requestAPI()` in `src/services/handler.ts`, under the `jupyterlab-leetcode/` URL namespace. Each server handler declares a `route` class attribute. To add an endpoint, write the handler and append it to the list in `jupyterlab_leetcode/handlers/__init__.py`.

Most handlers are thin GraphQL proxies. They call `self.graphql(name, query)` or `graphql_multi()` against `https://leetcode.com/graphql` and pass the raw response body through. The frontend unwraps `data.*` in `src/services/leetcode.ts`, and the response shapes are typed in `src/types/leetcode.d.ts`.

### Notebook generation (`utils/notebook_generator.py`)

`POST notebook/create` with `{titleSlug}` fetches the question detail and fills in `utils/notebook.template.json`. Template cells are found by `metadata.id`: `title`, `content`, `extra`, `test`, `pre_code`, `code`, `run`, and later `result`.

- The Python 3 snippet goes into the `code` cell, which is tagged `metadata.isSolutionCode = True`.
- Code before `class Solution:` (ListNode/TreeNode defs), along with `typing` imports inferred via `ast`, goes into a `pre_code` cell.
- The `run` cell is cloned once per example test case (`run_1`, `run_2`, …). LeetCode literals are converted (`null`/`true`/`false` → Python).
- Question info that submission needs (`submitUrl`, `questionId`, …) is stored in the notebook-level `metadata.leetcode_question_info`.
- Files are written **relative to the Jupyter server's cwd** into buckets of 50, such as `1-50/1.two-sum.ipynb`.

The package requires Python ≥ 3.12. The code relies on PEP 701 f-strings (nested same-type quotes) and `X | None` annotations. CI's `test_isolated` job installs the wheel on 3.12, the minimum.

### Submission

1. `src/index.ts` listens for opened notebooks. If a notebook has `metadata.leetcode_question_info`, it injects `LeetCodeToolbarWidget` (`NotebookToolbar.tsx`).
2. The Submit button saves the notebook and then calls `POST notebook/submit`. `SubmitNotebookHandler` takes the **last** code cell with `isSolutionCode`, so users can keep several solution attempts and the latest one is submitted. It re-reads the browser cookie, then POSTs to LeetCode, which returns a `submission_id`.
3. The frontend opens a WebSocket to `websocket/submit?submission_id=…`. `LeetCodeWebSocketSubmitHandler` polls `/submissions/detail/<id>/check/` with Fibonacci backoff and pushes `submissionResult` or `error` messages. This handler is a plain Tornado `WebSocketHandler`, not a `BaseHandler`.
4. The toolbar writes the formatted result into a markdown cell with `metadata.id == 'result'`, creating the cell if needed. It also saves the raw result to `metadata.leetcode_submission_result`.

### Frontend layout

- `src/index.ts` registers the single plugin (`jupyterlab-leetcode:plugin`) and the `leetcode-widget:open` command (palette + launcher), and restores layout.
- `src/widget.tsx` wraps the React trees in Lumino `ReactWidget`s, with `MantineProvider` for the main area.
- `src/components/LeetCodeMain.tsx` holds the main page: profile, statistics, calendar heatmap, and the question table with filters.
- `src/services/questionQuery.ts` persists the question filter state to `localStorage`.
- CSS modules live in `src/styles/*.module.css` and are copied to `lib/` by `jlpm copy`. Global styles live in `style/`, and only that directory is stylelinted.

## Conventions

- ESLint requires interface names to start with `I` (`IFoo`), single quotes, `curly: all`, and `eqeqeq`. Prettier uses single quotes, no trailing commas, and `arrowParens: avoid`.
- The version is defined in `package.json`. Hatch reads it via `hatch-nodejs-version`, and `jupyterlab_leetcode/_version.py` is generated. Bump it with `hatch version <v>`. Release steps are in `RELEASE.md`.
- The project was scaffolded from the JupyterLab extension copier template (`.copier-answers.yml`). The example Jest spec (`src/__tests__/jupyterlab_leetcode.spec.ts`) is still a template placeholder.
