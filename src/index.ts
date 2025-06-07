import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';

import { LeetCodeMainWidget, LeetCodeHeaderWidget } from './widget';

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
    let leetcodeWidget: LeetCodeMainWidget;

    const command = 'leetcode-widget:open';
    app.commands.addCommand(command, {
      label: 'Open LeetCode Widget',
      execute: () => {
        if (!leetcodeWidget || leetcodeWidget.isDisposed) {
          leetcodeWidget = new LeetCodeMainWidget(app, docManager);
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

    const addHeaderCommand = 'leetcode-widget:add-header';
    app.commands.addCommand(addHeaderCommand, {
      label: 'Add Header to LeetCode Widget',
      caption: 'Add Header to LeetCode Widget',
      execute: () => {
        const main = app.shell.currentWidget;
        if (main instanceof NotebookPanel) {
          const widget = new LeetCodeHeaderWidget(main);
          widget.node.style.minHeight = '20px';
          main.contentHeader.addWidget(widget);
        }
      }
    });
    palette.addItem({ command: addHeaderCommand, category: 'LeetCode' });

    const tracker = new WidgetTracker<LeetCodeMainWidget>({
      namespace: 'leetcode-widget'
    });
    if (restorer) {
      restorer.restore(tracker, { command, name: () => 'leetcode' });
    }
  }
};

export default plugin;
