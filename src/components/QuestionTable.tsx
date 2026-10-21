import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { listQuestions } from '../services/leetcode';
import { LeetCodeQuestion, LeetCodeQuestionQuery } from '../types/leetcode';
import QuestionItem from './QuestionItem';
import {
  Table,
  Text,
  ScrollArea,
  Skeleton,
  Transition,
  Center,
  Loader,
  VisuallyHidden
} from '@mantine/core';
import QuestionQueryKeyword from './QuestionQueryKeyword';
import QuestionDifficultyFilter from './QuestionDifficultyFilter';
import QuestionStatusFilter from './QuestionStatusFilter';
import QuestionTopicFilter from './QuestionTopicFilter';
import QuestionCompanyFilter from './QuestionCompanyFilter';
import {
  loadQuestionQuery,
  saveQuestionQuery
} from '../services/questionQuery';
import classes from '../styles/LeetCodeMain.module.css';

const ColumnCount = 6;

const QuestionTable: React.FC<{
  openNotebook: (p: string) => void;
  isPremium?: boolean;
}> = ({ openNotebook, isPremium }) => {
  const limit = 100;

  const [fetching, setFetching] = useState(true);
  const [skip, setSkip] = useState(0);
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [query, setQuery] = useState<LeetCodeQuestionQuery>(loadQuestionQuery);

  const updateQuery = (newQuery: LeetCodeQuestionQuery) => {
    setQuery(newQuery);
    setFetching(true);
    setQuestions([]);
    setSkip(0);
  };

  useEffect(() => {
    saveQuestionQuery(query);
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
            <Table.Td colSpan={ColumnCount}>
              <Skeleton height="1lh" radius="md" />
            </Table.Td>
          </Table.Tr>
        ));
    }
    if (!questions.length) {
      return (
        <Table.Tr>
          <Table.Td colSpan={ColumnCount}>
            <Text fw={500} ta="center" c="dimmed">
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
    <div className={`${classes.panel} ${classes.question_panel}`}>
      <div className={classes.filters}>
        <QuestionQueryKeyword
          keyword={query.keyword}
          updateKeyword={k => updateQuery({ ...query, keyword: k })}
        />
        <QuestionDifficultyFilter
          difficulties={query.difficulties}
          updateDifficulties={ds => updateQuery({ ...query, difficulties: ds })}
        />
        <QuestionStatusFilter
          statuses={query.statuses}
          updateStatuses={ss => updateQuery({ ...query, statuses: ss })}
        />
        <QuestionTopicFilter
          topics={query.topics}
          updateTopics={ts => updateQuery({ ...query, topics: ts })}
        />
        <QuestionCompanyFilter
          companies={query.companies}
          updateCompanies={cs => updateQuery({ ...query, companies: cs })}
          isPremium={isPremium}
        />
      </div>
      <ScrollArea
        type="scroll"
        style={{ flex: 1, minHeight: 0 }}
        onBottomReached={() => {
          if (!fetchingMore && hasMore) {
            setFetchingMore(true);
            setSkip(s => s + limit);
          }
        }}
      >
        <Table
          className={classes.table}
          stickyHeader
          verticalSpacing="xs"
          horizontalSpacing="sm"
          layout="fixed"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th className={classes.status_column}>
                <VisuallyHidden>Status</VisuallyHidden>
              </Table.Th>
              <Table.Th className={classes.num_column}>#</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th className={classes.difficulty_column}>
                Difficulty
              </Table.Th>
              <Table.Th className={classes.ac_column}>Acceptance</Table.Th>
              <Table.Th className={classes.generate_column}>
                <VisuallyHidden>Notebook</VisuallyHidden>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
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
    </div>
  );
};

export default QuestionTable;
