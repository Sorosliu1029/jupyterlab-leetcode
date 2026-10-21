import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Notification } from '@jupyterlab/apputils';
import { Container, Stack } from '@mantine/core';
import { getProfile } from '../services/leetcode';
import { LeetCodeProfile } from '../types/leetcode';
import classes from '../styles/LeetCodeMain.module.css';
import Profile from './Profile';
import ProjectLinks from './ProjectLinks';
import Statistics from './Statistics';
import QuestionTable from './QuestionTable';
import SubmissionCalendar from './SubmissionCalendar';

const LeetCodeMain: React.FC<{ docManager: IDocumentManager }> = ({
  docManager
}) => {
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

  return (
    <Container fluid={true} h="100%" p="lg">
      <Stack h="100%" gap="lg">
        <div className={`${classes.panel} ${classes.header}`}>
          <Profile profile={profile} />
          <Statistics username={profile?.username} />
          <SubmissionCalendar username={profile?.username} />
        </div>
        <QuestionTable
          openNotebook={openNoteBook}
          isPremium={profile?.isPremium}
        />
        <ProjectLinks />
      </Stack>
    </Container>
  );
};

export default LeetCodeMain;
