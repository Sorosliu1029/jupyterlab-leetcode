import React, { StrictMode } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import { createTheme, MantineProvider } from '@mantine/core';
import JupyterMainArea from './components/JupyterMainArea';
import LeetCodeNotebookToolbar from './components/LeetCodeNotebookToolbar';

// TODO: fix mantine override body line-height
const theme = createTheme({});

export class JupyterMainWidget extends ReactWidget {
  docManager: IDocumentManager;

  constructor(docManager: IDocumentManager) {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
    this.docManager = docManager;
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <MantineProvider theme={theme}>
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
