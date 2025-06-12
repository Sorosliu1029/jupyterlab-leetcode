import React from 'react';
import { Notification } from '@jupyterlab/apputils';
import { LeetCodeQuestion } from '../types/leetcode';
import { generateNotebook } from '../services/notebook';
import {
  ActionIcon,
  Anchor,
  Badge,
  Center,
  Group,
  Table,
  Text,
  Tooltip
} from '@mantine/core';
import {
  IconBrandLeetcode,
  IconCheck,
  IconCircle,
  IconLock
} from '@tabler/icons-react';
import { DifficultyColors } from './Statistics';
import classes from '../styles/LeetCodeMain.module.css';
import { LeetCodeMainColor } from './LandingPage';
import QuestionTopics from './QuestionTopcis';

const DifficultyAbbreviations: Record<string, string> = {
  easy: 'Easy',
  medium: 'Med.',
  hard: 'Hard'
};

export const StatusColors: Record<string, string> = {
  SOLVED: 'green',
  ATTEMPTED: 'violet',
  TO_DO: 'gray'
};

const IconProps = { size: 16, stroke: 1.5 };

const QuestionItem: React.FC<{
  question: LeetCodeQuestion;
  onGenerateSuccess: (p: string) => void;
}> = ({ question, onGenerateSuccess }) => {
  const [showGenerateIcon, setShowGenerateIcon] = React.useState(false);

  const statusIcon = () => {
    if (!question.status) {
      return null;
    }
    switch (question.status) {
      case 'SOLVED':
        return (
          <Tooltip fz="xs" label="Solved">
            <IconCheck color={StatusColors[question.status]} {...IconProps} />
          </Tooltip>
        );
      case 'ATTEMPTED':
        return (
          <Tooltip fz="xs" label="Attempted">
            <IconCircle color={StatusColors[question.status]} {...IconProps} />
          </Tooltip>
        );
      case 'TO_DO':
      default:
        return question.paidOnly ? (
          <Tooltip fz="xs" label="Paid Only">
            <IconLock color={LeetCodeMainColor} {...IconProps} />
          </Tooltip>
        ) : (
          <div style={{ width: IconProps.size, height: IconProps.size }}></div>
        );
    }
  };

  const generate = () => {
    generateNotebook(question.titleSlug)
      .then(({ filePath }) => {
        onGenerateSuccess(filePath);
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  };

  return (
    <Table.Tr
      onMouseEnter={() => setShowGenerateIcon(true)}
      onMouseLeave={() => setShowGenerateIcon(false)}
    >
      <Table.Td className={classes.title_column}>
        <Group gap="sm">
          {statusIcon()}
          <Anchor
            target="_blank"
            underline="never"
            href={`https://leetcode.com/problems/${question.titleSlug}`}
            fz="sm"
            fw={600}
          >
            {question.questionFrontendId}
            {'. '}
            {question.title}
          </Anchor>
        </Group>
      </Table.Td>

      <Table.Td className={classes.ac_column}>
        <Tooltip fz="xs" label="Acceptance Rate" position="top-start">
          <Text fz="sm" c="gray">
            {(question.acRate * 100).toFixed(2)}%
          </Text>
        </Tooltip>
      </Table.Td>

      <Table.Td className={classes.difficulty_column}>
        <Badge
          color={DifficultyColors[question.difficulty.toLowerCase()] || 'blue'}
          variant="light"
        >
          {DifficultyAbbreviations[question.difficulty.toLowerCase()]}
        </Badge>
      </Table.Td>

      <Table.Td className={classes.topic_column}>
        <QuestionTopics topics={question.topicTags} />
      </Table.Td>

      <Table.Td className={classes.generate_column}>
        {showGenerateIcon ? (
          <Center>
            <Tooltip fz="xs" label="Generate Notebook">
              <ActionIcon
                size="sm"
                variant="transparent"
                color={LeetCodeMainColor}
                onClick={() => generate()}
              >
                <IconBrandLeetcode stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Center>
        ) : (
          <div></div>
        )}
      </Table.Td>
    </Table.Tr>
  );
};

export default QuestionItem;
