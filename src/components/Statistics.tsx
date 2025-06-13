import React, { useEffect, useState } from 'react';
import {
  Center,
  Group,
  Paper,
  PaperProps,
  RingProgress,
  RingProgressProps,
  Stack,
  Text
} from '@mantine/core';
import { Notification } from '@jupyterlab/apputils';
import { getStatistics } from '../services/leetcode';
import { LeetCodeStatistics } from '../types/leetcode';
import DifficultyStatistics from './DifficultyStatistics';
import { IconCheck } from '@tabler/icons-react';
import { StatusColors } from './QuestionItem';

export const DifficultyColors: Record<string, string> = {
  easy: '#1CBBBA',
  medium: '#FFB700',
  hard: '#F53837'
};

const Statistics: React.FC<{
  username?: string;
  paperProps: PaperProps;
}> = ({ username, paperProps }) => {
  const [statistics, setStatistics] = useState<LeetCodeStatistics | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [difficultySections, setDifficultySections] = useState<
    RingProgressProps['sections'] | null
  >(null);
  const [beats, setBeats] = useState<number | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }
    getStatistics(username)
      .then(d => setStatistics(d))
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  }, [username]);

  const getAllQuestions = () => {
    if (!statistics?.userSessionProgress) {
      return;
    }

    const { userSessionProgress: sp } = statistics;
    return new Map(
      sp.allQuestionsCount.map(o => [o.difficulty.toLowerCase(), o.count])
    );
  };

  const getAcceptedQuestions = () => {
    const up =
      statistics?.userProfileUserQuestionProgressV2
        .userProfileUserQuestionProgressV2;
    if (!up) {
      return;
    }

    return new Map(
      up.numAcceptedQuestions.map(o => [o.difficulty.toLowerCase(), o.count])
    );
  };

  const getBeats = () => {
    const up =
      statistics?.userProfileUserQuestionProgressV2
        .userProfileUserQuestionProgressV2;
    if (!up) {
      return;
    }
    return new Map(
      up.userSessionBeatsPercentage.map(o => [
        o.difficulty.toLowerCase(),
        o.percentage
      ])
    );
  };

  const all = getAllQuestions();
  const accepted = getAcceptedQuestions();
  const totalBeats =
    statistics?.userProfileUserQuestionProgressV2
      .userProfileUserQuestionProgressV2.totalQuestionBeatsPercentage ?? 0;
  const difficultyBeats = getBeats();

  const getProgressSections = () => {
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
    <Paper {...paperProps} style={{ alignContent: 'center' }}>
      <Center>
        <Group>
          <RingProgress
            size={120}
            thickness={8}
            roundCaps
            transitionDuration={250}
            sections={
              isHovering && difficultySections
                ? difficultySections
                : getProgressSections()
            }
            label={
              <Center>
                <Stack gap={0} align="center">
                  {isHovering ? (
                    <>
                      <Text fz="xs">Beats</Text>
                      <Group gap={0}>
                        <Text fw="bolder" fz="lg">
                          {Math.floor(beats ?? totalBeats)}
                        </Text>
                        <Text fz="sm">
                          .{(beats ?? totalBeats).toFixed(2).split('.')[1]}%
                        </Text>
                      </Group>
                    </>
                  ) : (
                    <>
                      <Group gap={0}>
                        <Text fw="bolder" fz="lg">
                          {getTotalAc()}
                        </Text>
                        <Text fz="xs">/{getTotalCount()}</Text>
                      </Group>
                      <Group gap={0}>
                        <IconCheck
                          size={12}
                          stroke={1.5}
                          color={StatusColors['SOLVED']}
                        />
                        <Text fz="xs">Solved</Text>
                      </Group>
                    </>
                  )}
                </Stack>
              </Center>
            }
            onMouseOver={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          />
          <Stack gap="xs" w="5em">
            {Object.entries(DifficultyColors).map(([d, c]) => (
              <DifficultyStatistics
                key={d}
                text={d}
                color={c}
                solved={accepted?.get(d) ?? 0}
                total={all?.get(d) ?? 0}
                onHover={() => {
                  setIsHovering(true);
                  setBeats(difficultyBeats?.get(d) ?? 0);
                  setDifficultySections([
                    {
                      value: Math.round(
                        ((accepted?.get(d) ?? 0) / (all?.get(d) ?? 0)) * 100
                      ),
                      color: c
                    }
                  ]);
                }}
                onLeave={() => {
                  setIsHovering(false);
                  setBeats(null);
                  setDifficultySections(null);
                }}
              />
            ))}
          </Stack>
        </Group>
      </Center>
    </Paper>
  );
};

export default Statistics;
