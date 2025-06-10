import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Notification } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { getProfile } from '../services/leetcode';
import { LeetCodeProfile } from '../types/leetcode';
import Profile from './Profile';
import Statistics from './Statistics';
import QuestionList from './QuestionList';

const LeetCode: React.FC<{
  app: JupyterFrontEnd;
  docManager: IDocumentManager;
}> = ({ app, docManager }) => {
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);

  useEffect(() => {
    getProfile()
      .then(profile => {
        if (!profile.isSignedIn) {
          Notification.error('Please sign in to LeetCode.', {
            autoClose: 3000
          });
          return;
        }
        setProfile(profile);
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  }, []);

  const openNoteBook = (path: string) => {
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
