import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { listQuestions } from '../services/leetcode';
import { LeetCodeQuestion, LeetCodeQuestionQuery } from '../types/leetcode';
import QuestionItem from './QuestionItem';
import { Table, Text, Stack, ScrollArea, Skeleton } from '@mantine/core';
import QuestionQueryBar from './QuestionQueryBar';
import { useDebouncedState } from '@mantine/hooks';

const QuestionTable: React.FC<{
  openNotebook: (p: string) => void;
  height: number | string;
}> = ({ openNotebook, height }) => {
  const limit = 100;

  const [fetching, setFetching] = useState(true);
  const [skip, setSkip] = useState(0);
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [_finishedLength, setFinishedLength] = useState(0);
  const [_totalLength, setTotalLength] = useState(0);

  const [query, setQuery] = useDebouncedState<LeetCodeQuestionQuery>(
    {
      keyword: ''
    },
    100
  );

  const updateQuery = (newQuery: LeetCodeQuestionQuery) => {
    setQuery(newQuery);
    setFetching(true);
    setQuestions([]);
    setSkip(0);
  };

  useEffect(() => {
    listQuestions(query, skip, limit)
      .then(({ problemsetQuestionListV2 }) => {
        setFetching(false);
        const {
          questions: fetchedQuestions,
          hasMore: fetchedHasMore,
          finishedLength: fetchedFinishedLength,
          totalLength: fetchedTotalLength
        } = problemsetQuestionListV2;
        setQuestions(questions.concat(fetchedQuestions));
        setHasMore(fetchedHasMore);
        setFinishedLength(fetchedFinishedLength);
        setTotalLength(fetchedTotalLength);
      })
      .catch(e => {
        Notification.error(e.message, { autoClose: 3000 });
      });
  }, [query, skip]);

  const getTableRows = () => {
    if (fetching) {
      return new Array(10).fill(null).map((_, i) => (
        <Table.Tr key={i}>
          <Table.Td>
            <Skeleton height={40} mt="md" radius="xl" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (!questions.length) {
      return (
        <Table.Tr>
          <Table.Td>
            <Text fw={500} ta="center">
              Nothing found
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    }

    return questions.map(q => (
      <QuestionItem
        key={q.id}
        question={q}
        onGenerateSuccess={(path: string) => openNotebook(path)}
      />
    ));
  };

  return (
    <Stack h={height} pb="lg">
      <QuestionQueryBar query={query} updateQuery={updateQuery} />
      <ScrollArea
        type="scroll"
        onBottomReached={() => (hasMore ? setSkip(skip + limit) : null)}
      >
        <Table
          striped={!fetching}
          withRowBorders={false}
          verticalSpacing="xs"
          layout="fixed"
        >
          <Table.Tbody>{getTableRows()}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
};

export default QuestionTable;
