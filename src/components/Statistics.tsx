import React, { useEffect, useState } from 'react';
import { Group, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { Notification } from '@jupyterlab/apputils';
import { getStatistics } from '../services/leetcode';
import { LeetCodeStatistics } from '../types/leetcode';
import classes from '../styles/LeetCodeMain.module.css';

export const DifficultyColors: Record<string, string> = {
  easy: 'var(--jp-success-color1)',
  medium: 'var(--jp-warn-color1)',
  hard: 'var(--jp-error-color1)'
};

const toMap = (list: { difficulty: string; count: number }[]) =>
  new Map(list.map(o => [o.difficulty.toLowerCase(), o.count]));

const formatBeats = (p?: number) =>
  p === undefined ? '' : `Beats ${p.toFixed(1)}%`;

const Statistics: React.FC<{ username?: string }> = ({ username }) => {
  const [statistics, setStatistics] = useState<LeetCodeStatistics | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }
    getStatistics(username)
      .then(d => setStatistics(d))
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  }, [username]);

  const progress =
    statistics?.userProfileUserQuestionProgressV2
      .userProfileUserQuestionProgressV2;
  if (!statistics?.userSessionProgress || !progress) {
    return (
      <Stack className={classes.solved} gap="xs">
        <Skeleton height="1lh" width="60%" />
        {Object.keys(DifficultyColors).map(d => (
          <Skeleton key={d} height={6} radius="sm" />
        ))}
      </Stack>
    );
  }

  const all = toMap(statistics.userSessionProgress.allQuestionsCount);
  const accepted = toMap(progress.numAcceptedQuestions);
  const beats = new Map(
    progress.userSessionBeatsPercentage.map(o => [
      o.difficulty.toLowerCase(),
      o.percentage
    ])
  );
  const totalAc = [...accepted.values()].reduce((a, b) => a + b, 0);

  return (
    <Stack className={classes.solved} gap="xs">
      <Group gap="xs" align="baseline">
        <Text fw={700} fz="lg">
          {totalAc}
        </Text>
        <Text className={classes.mono}>/{all.get('all') ?? 0} solved</Text>
        <Text className={classes.mono} ml="auto">
          {formatBeats(progress.totalQuestionBeatsPercentage)}
        </Text>
      </Group>
      {Object.keys(DifficultyColors).map(d => {
        const solved = accepted.get(d) ?? 0;
        const total = all.get(d) ?? 0;
        return (
          <Tooltip
            key={d}
            fz="xs"
            label={formatBeats(beats.get(d))}
            disabled={!beats.has(d)}
            position="right"
          >
            <div className={classes.solved_row}>
              <Text
                tt="capitalize"
                fz="sm"
                className={`${classes.difficulty} ${classes[d]}`}
              >
                {d}
              </Text>
              <div className={`${classes.bar} ${classes[d]}`}>
                <span
                  style={{ width: `${total ? (solved / total) * 100 : 0}%` }}
                ></span>
              </div>
              <Text className={classes.mono}>
                {solved}/{total}
              </Text>
            </div>
          </Tooltip>
        );
      })}
    </Stack>
  );
};

export default Statistics;
