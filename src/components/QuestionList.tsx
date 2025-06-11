import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { listQuestions } from '../services/leetcode';
import { LeetCodeQuestion } from '../types/leetcode';
import QuestionItem from './QuestionItem';
import { Table, TextInput, Text, Stack, ScrollArea } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const QuestionList: React.FC<{
  openNotebook: (p: string) => void;
  height: number | string;
}> = ({ openNotebook, height }) => {
  const [skip, setSkip] = useState(0);
  const limit = 100;
  const [keyword, setKeyword] = useState('');
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [_finishedLength, setFinishedLength] = useState(0);
  const [_totalLength, setTotalLength] = useState(0);

  useEffect(() => setSkip(0), [keyword]);

  useEffect(() => {
    setFetching(true);
    listQuestions(keyword, skip, limit)
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
        setFetching(false);
        Notification.error(e.message, { autoClose: 3000 });
      });
  }, [keyword, skip]);

  return (
    <Stack h={height} pb="lg">
      <TextInput
        placeholder="Search questions"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={keyword}
        onChange={e => setKeyword(e.currentTarget.value)}
      />
      <ScrollArea
        type="scroll"
        onBottomReached={() => {
          if (!hasMore || fetching) {
            return;
          }
          setSkip(skip + limit);
        }}
      >
        <Table
          striped
          withRowBorders={false}
          verticalSpacing="xs"
          layout="fixed"
        >
          <Table.Tbody>
            {questions.length > 0 ? (
              questions.map(q => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  onGenerateSuccess={(path: string) => openNotebook(path)}
                />
              ))
            ) : (
              <Table.Tr>
                {/* TODO: loading when perform web request */}
                <Table.Td>
                  <Text fw={500} ta="center">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
};

export default QuestionList;
