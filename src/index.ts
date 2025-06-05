import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import LeetCodeWidget from './widget';

/**
 * Initialization data for the jupyterlab-leetcode extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-leetcode:plugin',
  description: 'Integrate LeetCode into beloved Jupyter.',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    restorer: ILayoutRestorer | null
  ) => {
    console.log('JupyterLab extension jupyterlab-leetcode is activated!');

    let leetcodeWidget: LeetCodeWidget;

    const command = 'leetcode-widget:open';
    app.commands.addCommand(command, {
      label: 'Open LeetCode Widget',
      execute: () => {
        if (!leetcodeWidget || leetcodeWidget.isDisposed) {
          leetcodeWidget = new LeetCodeWidget();
        }
        if (!tracker.has(leetcodeWidget)) {
          tracker.add(leetcodeWidget);
        }
        if (!leetcodeWidget.isAttached) {
          app.shell.add(leetcodeWidget, 'right', { rank: 599 });
        }
        app.shell.activateById(leetcodeWidget.id);
      }
    });

    palette.addItem({ command, category: 'LeetCode' });
    const tracker = new WidgetTracker<LeetCodeWidget>({
      namespace: 'leetcode-widget'
    });
    if (restorer) {
      console.log('Restoring layout for jupyterlab-leetcode plugin');
      restorer.restore(tracker, { command, name: () => 'leetcode' });
    }
  }
};

export default plugin;
