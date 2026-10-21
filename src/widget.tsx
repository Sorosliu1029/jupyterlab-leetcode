import React, { StrictMode } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { IThemeManager } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  createTheme,
  MantineProvider,
  MantineThemeOverride
} from '@mantine/core';
import JupyterMainArea from './components/JupyterMainArea';
import NotebookToolbar from './components/NotebookToolbar';

export class JupyterMainWidget extends ReactWidget {
  docManager: IDocumentManager;
  themeManager: IThemeManager | null;
  theme: MantineThemeOverride;

  constructor(
    docManager: IDocumentManager,
    themeManager: IThemeManager | null
  ) {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
    this.docManager = docManager;
    this.themeManager = themeManager;
    this.theme = createTheme({});

    // follow JupyterLab light/dark theme; Widget.dispose clears this connection
    themeManager?.themeChanged.connect(() => this.update(), this);

    // fix mantine override body line-height
    const s = getComputedStyle(document.documentElement);
    if (s.getPropertyValue('--mantine-line-height')) {
      document.body.style.lineHeight = 'unset';
    }
  }

  get colorScheme(): 'light' | 'dark' {
    const name = this.themeManager?.theme;
    return name && !this.themeManager?.isLight(name) ? 'dark' : 'light';
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <MantineProvider theme={this.theme} forceColorScheme={this.colorScheme}>
          <JupyterMainArea docManager={this.docManager} />
        </MantineProvider>
      </StrictMode>
    );
  }
}

export class LeetCodeToolbarWidget extends ReactWidget {
  notebook: NotebookPanel;

  constructor(notebook: NotebookPanel) {
    super();
    this.id = 'JupyterlabLeetcodeNotebookToolbarWidget';
    this.notebook = notebook;
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <NotebookToolbar notebook={this.notebook} />
      </StrictMode>
    );
  }
}
