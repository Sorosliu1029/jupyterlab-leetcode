import React, { useEffect, useState } from 'react';
import { Center, Group, Paper, RingProgress, Stack, Text } from '@mantine/core';
import { Notification } from '@jupyterlab/apputils';
import { getStatistics } from '../services/leetcode';
import { LeetCodeStatistics } from '../types/leetcode';
import DifficultyStatistics from './DifficultyStatistics';

export const DifficultyColors: Record<string, string> = {
  easy: '#1CBBBA',
  medium: '#FFB700',
  hard: '#F53837'
};

const Statistics: React.FC<{
  username: string;
}> = ({ username }) => {
  const [statistics, setStatistics] = useState<LeetCodeStatistics | null>(null);
  const [all, setAll] = useState<Map<string, number> | null>(null);
  const [accepted, setAccepted] = useState<Map<string, number> | null>(null);
  const [__beats, setBeats] = useState<Map<string, number> | null>(null);

  useEffect(() => {
    getStatistics(username)
      .then(d => {
        setStatistics(d);
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  }, []);

  useEffect(() => {
    if (!statistics?.userSessionProgress) {
      return;
    }

    const { userSessionProgress: sp } = statistics;
    setAll(
      new Map(
        sp.allQuestionsCount.map(o => [o.difficulty.toLowerCase(), o.count])
      )
    );
  }, [statistics?.userSessionProgress]);

  useEffect(() => {
    const up =
      statistics?.userProfileUserQuestionProgressV2
        .userProfileUserQuestionProgressV2;
    if (!up) {
      return;
    }

    setAccepted(
      new Map(
        up.numAcceptedQuestions.map(o => [o.difficulty.toLowerCase(), o.count])
      )
    );

    const b = new Map(
      up.userSessionBeatsPercentage.map(o => [
        o.difficulty.toLowerCase(),
        o.percentage
      ])
    );
    setBeats(b);
  }, [statistics?.userProfileUserQuestionProgressV2]);

  const getSections = () => {
    if (!all || !accepted) {
      return [];
    }

    return Object.entries(DifficultyColors).map(([d, c]) => ({
      value: Math.round(((accepted.get(d) || 0) / (all.get('all') || 0)) * 100),
      color: c,
      tooltip: d.charAt(0).toUpperCase() + d.slice(1)
    }));
  };

  const getTotalAc = () =>
    accepted ? [...accepted.values()].reduce((a, b) => a + b, 0) : 0;

  const getTotalCount = () => all?.get('all') || 0;

  return (
    <Paper
      shadow="md"
      radius="md"
      withBorder
      p="sm"
      bg="var(--mantine-color-body)"
    >
      <Group>
        <RingProgress
          size={120}
          thickness={8}
          roundCaps
          sections={getSections()}
          label={
            <Center>
              <Text fw={500} fz="md">
                {getTotalAc()}
              </Text>
              <Text fz="sm">/{getTotalCount()}</Text>
            </Center>
          }
        />
        <Stack>
          {Object.entries(DifficultyColors).map(([d, c]) => (
            <DifficultyStatistics key={d} text={d} color={c} />
          ))}
        </Stack>
      </Group>
    </Paper>
  );
};

export default Statistics;
