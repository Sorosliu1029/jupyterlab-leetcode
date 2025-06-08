import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import {
  ICommandPalette,
  WidgetTracker,
  MainAreaWidget
} from '@jupyterlab/apputils';
import {
  IDocumentManager,
  IDocumentWidgetOpener
} from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';

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
  optional: [ILayoutRestorer, ILauncher],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    docManager: IDocumentManager,
    docWidgetOpener: IDocumentWidgetOpener,
    restorer: ILayoutRestorer | null,
    launcher: ILauncher | null
  ) => {
    let leetcodeWidget: MainAreaWidget<LeetCodeMainWidget>;

    const command = 'leetcode-widget:open';
    app.commands.addCommand(command, {
      caption: 'Open LeetCode Widget',
      label: 'Open LeetCode Widget',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        if (!leetcodeWidget || leetcodeWidget.isDisposed) {
          leetcodeWidget = new MainAreaWidget<LeetCodeMainWidget>({
            content: new LeetCodeMainWidget(app, docManager)
          });
          leetcodeWidget.title.label = 'LeetCode Widget';
          leetcodeWidget.title.icon = reactIcon;
        }
        if (!tracker.has(leetcodeWidget)) {
          tracker.add(leetcodeWidget);
        }
        if (!leetcodeWidget.isAttached) {
          app.shell.add(leetcodeWidget, 'main');
        }
        app.shell.activateById(leetcodeWidget.id);
      }
    });
    palette.addItem({ command, category: 'LeetCode' });
    if (launcher) {
      launcher.add({ command, category: 'LeetCode', rank: 1 });
    }
    const tracker = new WidgetTracker<MainAreaWidget<LeetCodeMainWidget>>({
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
