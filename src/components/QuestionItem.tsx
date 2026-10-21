import React, { useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { LeetCodeQuestion } from '../types/leetcode';
import { generateNotebook } from '../services/notebook';
import { Anchor, Button, Table, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCircle, IconLock } from '@tabler/icons-react';
import classes from '../styles/LeetCodeMain.module.css';
import QuestionTopics from './QuestionTopcis';

const DifficultyNames: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
};

export const StatusColors: Record<string, string> = {
  SOLVED: 'var(--jp-success-color1)',
  ATTEMPTED: 'var(--jp-warn-color1)',
  TO_DO: 'var(--jp-ui-font-color2)'
};

const IconProps = { size: 16, stroke: 1.5 };

const QuestionItem: React.FC<{
  question: LeetCodeQuestion;
  onGenerateSuccess: (p: string) => void;
}> = ({ question, onGenerateSuccess }) => {
  const [generating, setGenerating] = useState(false);

  const statusIcon = () => {
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
      default:
        return question.paidOnly ? (
          <Tooltip fz="xs" label="Paid Only">
            <IconLock color={StatusColors['TO_DO']} {...IconProps} />
          </Tooltip>
        ) : null;
    }
  };

  const generate = () => {
    setGenerating(true);
    generateNotebook(question.titleSlug)
      .then(({ filePath }) => {
        onGenerateSuccess(filePath);
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }))
      .finally(() => setGenerating(false));
  };

  const difficulty = question.difficulty.toLowerCase();

  return (
    <Table.Tr>
      <Table.Td>{statusIcon()}</Table.Td>

      <Table.Td className={classes.mono}>
        {question.questionFrontendId}
      </Table.Td>

      <Table.Td>
        <Anchor
          target="_blank"
          underline="hover"
          href={`https://leetcode.com/problems/${question.titleSlug}`}
          fz="sm"
          className={classes.title}
        >
          {question.title}
        </Anchor>
        <QuestionTopics topics={question.topicTags} />
      </Table.Td>

      <Table.Td>
        <Text
          fz="sm"
          className={`${classes.difficulty} ${classes[difficulty]}`}
        >
          {DifficultyNames[difficulty] ?? question.difficulty}
        </Text>
      </Table.Td>

      <Table.Td className={classes.mono}>
        {(question.acRate * 100).toFixed(1)}%
      </Table.Td>

      <Table.Td>
        <Button
          size="compact-xs"
          variant="outline"
          color="var(--jp-brand-color1)"
          loading={generating}
          onClick={generate}
        >
          Open notebook
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

export default QuestionItem;
