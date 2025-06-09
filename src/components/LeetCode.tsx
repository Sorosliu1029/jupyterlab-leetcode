import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IDocumentWidget } from '@jupyterlab/docregistry';
import { JupyterFrontEnd, LabShell } from '@jupyterlab/application';
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
    // TODO: notebook.NotebookActions.runCells of pre-code cell
    docManager.openOrReveal(path);
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
