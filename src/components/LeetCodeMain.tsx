import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Notification } from '@jupyterlab/apputils';
import { Container, Group, Stack } from '@mantine/core';
import { getProfile } from '../services/leetcode';
import { LeetCodeProfile } from '../types/leetcode';
import Profile from './Profile';
import Statistics from './Statistics';
import QuestionTable from './QuestionTable';

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

  const calcHeight = () => {
    const mainEle = document.querySelector('#jll-main');
    const profileEle = document.querySelector('#jll-profile');
    if (!mainEle || !profileEle) {
      return '100%';
    }
    const mainStyle = window.getComputedStyle(mainEle);
    const padding =
      parseFloat(mainStyle.paddingTop) + parseFloat(mainStyle.paddingBottom);
    return mainEle.clientHeight - padding - profileEle.clientHeight;
  };

  return (
    <Container fluid={true} h="100%" p="lg" id="jll-main">
      <Stack>
        <Group id="jll-profile" h={146}>
          {profile && <Profile profile={profile} />}
          {profile && <Statistics username={profile.username} />}
        </Group>
        <QuestionTable openNotebook={openNoteBook} height={calcHeight()} />
      </Stack>
    </Container>
  );
};

export default LeetCodeMain;
