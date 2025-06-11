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
import '@mantine/core/styles.css';
import { LeetCodeIcon } from './icons/leetcode';

import { JupyterMainWidget, LeetCodeToolbarWidget } from './widget';

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
    let leetcodeWidget: MainAreaWidget<JupyterMainWidget>;

    const command = 'leetcode-widget:open';
    app.commands.addCommand(command, {
      caption: 'Open LeetCode Widget',
      label: 'Open LeetCode Widget',
      icon: args => (args['isPalette'] ? undefined : LeetCodeIcon),
      execute: () => {
        if (!leetcodeWidget || leetcodeWidget.isDisposed) {
          leetcodeWidget = new MainAreaWidget<JupyterMainWidget>({
            content: new JupyterMainWidget(docManager)
          });
          leetcodeWidget.title.label = 'LeetCode Widget';
          leetcodeWidget.title.icon = LeetCodeIcon;
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

    // add to palette
    palette.addItem({ command, category: 'LeetCode' });
    // add to launcher
    if (launcher) {
      launcher.add({ command, category: 'LeetCode', rank: 1 });
    }
    // restore open/close status
    const tracker = new WidgetTracker<MainAreaWidget<JupyterMainWidget>>({
      namespace: 'leetcode-widget'
    });
    if (restorer) {
      restorer.restore(tracker, { command, name: () => 'leetcode' });
    }
    // auto attach to LeetCode notebook
    docWidgetOpener.opened.connect((__sender, widget) => {
      if (widget instanceof NotebookPanel) {
        widget.revealed.then(() => {
          if (widget.model?.metadata?.leetcode_question_info) {
            const toolbarItem = new LeetCodeToolbarWidget(widget);
            widget.toolbar.insertAfter('cellType', 'leetcode', toolbarItem);
          }
        });
      }
    });
  }
};

export default plugin;
