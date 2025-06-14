## Integrate LeetCode into beloved Jupyter.

https://github.com/user-attachments/assets/6b8aaf10-ff05-44b6-a6c9-ce0c6e357f2d

#### Requirements

- JupyterLab >= 4.0.0

#### Install

To install the extension, execute:

```bash
pip install jupyterlab_leetcode
```

#### Get Started

After choosing the browser, you will be prompted like:

<img alt="password-prompt" src="https://raw.githubusercontent.com/Sorosliu1029/jupyterlab-leetcode/refs/heads/master/docs/statics/password-prompt.png" width="400" />

This is because this plugin is based on [browser-cookie3](https://github.com/borisbabic/browser_cookie3), which needs permission to read cookie files.

You can choose 'Always Allow'.

#### Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_leetcode
```

#### Troubleshoot

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
