import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { listQuestions } from '../services/leetcode';
import { LeetCodeQuestion, LeetCodeQuestionQuery } from '../types/leetcode';
import QuestionItem from './QuestionItem';
import {
  Table,
  Text,
  Stack,
  ScrollArea,
  Skeleton,
  Group,
  Transition,
  Center,
  Loader
} from '@mantine/core';
import QuestionQueryKeyword from './QuestionQueryKeyword';
import QuestionDifficultyFilter from './QuestionDifficultyFilter';
import QuestionStatusFilter from './QuestionStatusFilter';
import QuestionTopicFilter from './QuestionTopicFilter';
import QuestionCompanyFilter from './QuestionCompanyFilter';

const QuestionTable: React.FC<{
  openNotebook: (p: string) => void;
  height: number | string;
  isPremium?: boolean;
}> = ({ openNotebook, height, isPremium }) => {
  const limit = 100;

  const [fetching, setFetching] = useState(true);
  const [skip, setSkip] = useState(0);
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [query, setQuery] = useState<LeetCodeQuestionQuery>({
    keyword: '',
    difficulties: [],
    statuses: [],
    topics: [],
    companies: []
  });

  const updateQuery = (newQuery: LeetCodeQuestionQuery) => {
    setQuery(newQuery);
    setFetching(true);
    setQuestions([]);
    setSkip(0);
  };

  useEffect(() => {
    listQuestions(query, skip, limit)
      .then(({ problemsetQuestionListV2 }) => {
        const qs = fetching ? [] : questions; // fix datarace to ensure distinct key
        setFetching(false);
        setFetchingMore(false);
        const { questions: fetchedQuestions, hasMore: fetchedHasMore } =
          problemsetQuestionListV2;
        setQuestions(qs.concat(fetchedQuestions));
        setHasMore(fetchedHasMore);
      })
      .catch(e => {
        Notification.error(e.message, { autoClose: 3000 });
      });
  }, [query, skip]);

  const getTableRows = () => {
    if (fetching) {
      return Array(10)
        .fill(null)
        .map((_, i) => (
          <Table.Tr key={i}>
            <Table.Td>
              <Skeleton height="1lh" radius="md" />
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
      <Group>
        <QuestionQueryKeyword
          updateKeyword={k => updateQuery({ ...query, keyword: k })}
        />
        <QuestionStatusFilter
          updateStatuses={ss => updateQuery({ ...query, statuses: ss })}
        />
        <QuestionDifficultyFilter
          updateDifficulties={ds => updateQuery({ ...query, difficulties: ds })}
        />
        <QuestionTopicFilter
          updateTopics={ts => updateQuery({ ...query, topics: ts })}
        />
        <QuestionCompanyFilter
          updateCompanies={cs => updateQuery({ ...query, companies: cs })}
          isPremium={isPremium}
        />
      </Group>
      <ScrollArea
        type="scroll"
        onBottomReached={() => {
          if (!fetchingMore && hasMore) {
            setFetchingMore(true);
            setSkip(s => s + limit);
          }
        }}
      >
        <Table
          striped
          withRowBorders={false}
          verticalSpacing="xs"
          layout="fixed"
        >
          <Table.Tbody>{getTableRows()}</Table.Tbody>
        </Table>
        <Transition
          mounted={fetchingMore}
          transition="fade"
          duration={400}
          timingFunction="ease"
        >
          {styles => (
            <Center style={styles}>
              <Loader size="xs" />
            </Center>
          )}
        </Transition>
      </ScrollArea>
    </Stack>
  );
};

export default QuestionTable;
