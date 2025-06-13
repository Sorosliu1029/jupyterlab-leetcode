# jupyterlab_leetcode

⚠️  STILL UNDER ACTIVE (but not rapid) DEVELOPMENT

[![Github Actions Status](https://github.com/Sorosliu1029/jupyterlab-leetcode/workflows/Build/badge.svg)](https://github.com/Sorosliu1029/jupyterlab-leetcode/actions/workflows/build.yml)

Integrate LeetCode into beloved Jupyter.

This extension is composed of a Python package named `jupyterlab_leetcode`
for the server extension and a NPM package named `jupyterlab-leetcode`
for the frontend extension.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab_leetcode
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_leetcode
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

