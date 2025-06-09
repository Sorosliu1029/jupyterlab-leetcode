import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IDocumentWidget } from '@jupyterlab/docregistry';
import { JupyterFrontEnd, LabShell } from '@jupyterlab/application';
import { NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { getProfile } from '../services/leetcode';
import { LeetCodeProfile } from '../types/leetcode';
import Profile from './Profile';
import Statistics from './Statistics';
import QuestionList from './QuestionList';

export function getCurrentOpenFilePath(
  shell: LabShell,
  docManager: IDocumentManager,
  widget?: IDocumentWidget
): string | null {
  const currentWidget = widget ?? shell.currentWidget;
  if (!currentWidget || !docManager) {
    return null;
  }
  const context = docManager.contextForWidget(currentWidget);
  if (!context) {
    return null;
  }
  return context.path;
}

const LeetCode: React.FC<{
  app: JupyterFrontEnd;
  docManager: IDocumentManager;
}> = ({ app, docManager }) => {
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);

  useEffect(() => {
    getProfile()
      .then(profile => {
        if (!profile.isSignedIn) {
          alert('Please sign in to LeetCode.');
          return;
        }
        setProfile(profile);
      })
      .catch(console.error);
  }, []);

  const openNoteBook = (path: string) => {
    const docWidget = docManager.openOrReveal(path);
    if (docWidget && docWidget instanceof NotebookPanel) {
      docWidget.revealed.then(() => {
        let idx = 0;
        for (const cell of docWidget.content.model?.cells ?? []) {
          if (cell.metadata['id'] === 'pre_code') {
            docWidget.content.activeCellIndex = idx;
            docWidget.context.ready.then(() => {
              // FIXME: not running..., dont know why
              NotebookActions.run(docWidget.content);
            });
          }
          idx++;
        }
      });
    }
  };

  return profile ? (
    <div>
      <Profile profile={profile} />
      <Statistics username={profile.username} />
      <QuestionList openNotebook={openNoteBook} />
    </div>
  ) : null;
};

export default LeetCode;
