import React from 'react';
import { TextInput } from '@mantine/core';
import classes from '../styles/LeetCodeMain.module.css';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';

const QuestionQueryBar: React.FC<{
  updateKeyword: (keyword: string) => void;
  keyword: string;
}> = ({ updateKeyword, keyword }) => {
  const debounced = useDebouncedCallback(updateKeyword, 200);

  return (
    <TextInput
      className={classes.search}
      placeholder="Search questions"
      leftSection=<IconSearch size={16} stroke={1.5} />
      defaultValue={keyword}
      onChange={e => debounced(e.target.value)}
    />
  );
};

export default QuestionQueryBar;
