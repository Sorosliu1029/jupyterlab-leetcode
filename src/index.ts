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
import { leetcodeIcon } from './icons/leetcode';

import { LeetCodeMainWidget, LeetCodeToolbarWidget } from './widget';

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
      caption: 'LeetCode',
      label: 'LeetCode',
      icon: args => (args['isPalette'] ? undefined : leetcodeIcon),
      execute: () => {
        if (!leetcodeWidget || leetcodeWidget.isDisposed) {
          leetcodeWidget = new MainAreaWidget<LeetCodeMainWidget>({
            content: new LeetCodeMainWidget(app, docManager)
          });
          leetcodeWidget.title.label = 'LeetCode Widget';
          leetcodeWidget.title.icon = leetcodeIcon;
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
    const tracker = new WidgetTracker<MainAreaWidget<LeetCodeMainWidget>>({
      namespace: 'leetcode-widget'
    });
    if (restorer) {
      restorer.restore(tracker, { command, name: () => 'leetcode' });
    }
    // auto attach to LeetCode notebook
    docWidgetOpener.opened.connect((sender, widget) => {
      if (widget instanceof NotebookPanel) {
        widget.revealed.then(() => {
          if (widget.model?.metadata?.leetcode_question_info) {
            const toolbarItem = new LeetCodeToolbarWidget(widget);
            widget.toolbar.insertBefore('spacer', 'leetcode', toolbarItem);
          }
        });
      }
    });
  }
};

export default plugin;
