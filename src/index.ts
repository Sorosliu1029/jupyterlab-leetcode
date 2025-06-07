import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';

import LeetCodeWidget from './widget';

const PLUGIN_ID = 'jupyterlab-leetcode:plugin';

/**
 * Initialization data for the jupyterlab-leetcode extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'Integrate LeetCode into beloved Jupyter.',
  autoStart: true,
  requires: [ICommandPalette, IDocumentManager],
  optional: [ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    docManager: IDocumentManager,
    restorer: ILayoutRestorer | null
  ) => {
    let leetcodeWidget: LeetCodeWidget;

    const command = 'leetcode-widget:open';
    app.commands.addCommand(command, {
      label: 'Open LeetCode Widget',
      execute: () => {
        if (!leetcodeWidget || leetcodeWidget.isDisposed) {
          leetcodeWidget = new LeetCodeWidget(docManager);
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
      restorer.restore(tracker, { command, name: () => 'leetcode' });
    }
  }
};

export default plugin;
