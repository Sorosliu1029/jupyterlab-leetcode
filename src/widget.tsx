import React, { StrictMode } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  createTheme,
  MantineProvider,
  MantineThemeOverride
} from '@mantine/core';
import JupyterMainArea from './components/JupyterMainArea';
import LeetCodeNotebookToolbar from './components/LeetCodeNotebookToolbar';

export class JupyterMainWidget extends ReactWidget {
  docManager: IDocumentManager;
  theme: MantineThemeOverride;

  constructor(docManager: IDocumentManager) {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
    this.docManager = docManager;
    // TODO: fix mantine override body line-height
    this.theme = createTheme({});
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <MantineProvider theme={this.theme}>
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
        <LeetCodeNotebookToolbar notebook={this.notebook} />
      </StrictMode>
    );
  }
}
