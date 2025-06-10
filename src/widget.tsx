import React, { StrictMode } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { NotebookPanel } from '@jupyterlab/notebook';
import { createTheme, MantineProvider } from '@mantine/core';
import LeetCodeMainArea from './components/LeetCodeMainArea';
import LeetCodeNotebookToolbar from './components/LeetCodeNotebookToolbar';

const theme = createTheme({});

export class LeetCodeMainWidget extends ReactWidget {
  app: JupyterFrontEnd;
  docManager: IDocumentManager;

  constructor(app: JupyterFrontEnd, docManager: IDocumentManager) {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
    this.app = app;
    this.docManager = docManager;
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <MantineProvider theme={theme}>
          <LeetCodeMainArea app={this.app} docManager={this.docManager} />
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
