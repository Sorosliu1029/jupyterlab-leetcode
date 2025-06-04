import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import LeetCodeWidget from './widget';

/**
 * Initialization data for the jupyterlab-leetcode extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-leetcode:plugin',
  description: 'Integrate LeetCode into beloved Jupyter.',
  autoStart: true,
  requires: [],
  optional: [],
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-leetcode is activated!');

    const leetcodeWidget: LeetCodeWidget = new LeetCodeWidget();
    app.shell.add(leetcodeWidget, 'right', { rank: 599 });
  }
};

export default plugin;
