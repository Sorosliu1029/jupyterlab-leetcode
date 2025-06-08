import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import {
  IDocumentManager,
  IDocumentWidgetOpener
} from '@jupyterlab/docmanager';
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
  requires: [ICommandPalette, IDocumentManager, IDocumentWidgetOpener],
  optional: [ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    docManager: IDocumentManager,
    docWidgetOpener: IDocumentWidgetOpener,
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
    const tracker = new WidgetTracker<LeetCodeMainWidget>({
      namespace: 'leetcode-widget'
    });
    if (restorer) {
      restorer.restore(tracker, { command, name: () => 'leetcode' });
    }

    docWidgetOpener.opened.connect((sender, widget) => {
      if (widget instanceof NotebookPanel) {
        widget.revealed.then(() => {
          if (widget.model?.metadata?.leetcode_question_info) {
            const header = new LeetCodeHeaderWidget(widget);
            header.node.style.minHeight = '20px';
            if (widget.contentHeader.widgets.every(w => w.id !== header.id)) {
              widget.contentHeader.addWidget(header);
            }
          }
        });
      }
    });
  }
};

export default plugin;
