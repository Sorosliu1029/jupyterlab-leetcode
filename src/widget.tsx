import { ReactWidget } from '@jupyterlab/ui-components';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { JupyterFrontEnd } from '@jupyterlab/application';
import React, { StrictMode } from 'react';
import LeetCodeMainArea from './components/LeetCodeMainArea';
import LeetCodeNotebookHeader from './components/LeetCodeNotebookHeader';
import { NotebookPanel } from '@jupyterlab/notebook';

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
        <LeetCodeMainArea app={this.app} docManager={this.docManager} />
      </StrictMode>
    );
  }
}

export class LeetCodeHeaderWidget extends ReactWidget {
  notebook: NotebookPanel;

  constructor(notebook: NotebookPanel) {
    super();
    this.id = 'JupyterlabLeetcodeNotebookHeaderWidget';
    this.notebook = notebook;
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <LeetCodeNotebookHeader notebook={this.notebook} />
      </StrictMode>
    );
  }
}
