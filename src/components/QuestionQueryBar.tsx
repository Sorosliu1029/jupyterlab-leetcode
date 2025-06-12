import React from 'react';
import { LeetCodeQuestionQuery } from '../types/leetcode';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const QuestionQueryBar: React.FC<{
  query: LeetCodeQuestionQuery;
  updateQuery: (query: LeetCodeQuestionQuery) => void;
}> = ({ query, updateQuery }) => {
  return (
    <TextInput
      placeholder="Search questions"
      mb="md"
      leftSection={<IconSearch size={16} stroke={1.5} />}
      value={query.keyword}
      onChange={e => updateQuery({ ...query, keyword: e.target.value })}
    />
  );
};

export default QuestionQueryBar;
