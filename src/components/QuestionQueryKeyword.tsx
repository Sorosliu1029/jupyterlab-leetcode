import React from 'react';
import { Group, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';

const QuestionQueryBar: React.FC<{
  updateKeyword: (keyword: string) => void;
  keyword: string;
}> = ({ updateKeyword, keyword }) => {
  const debounced = useDebouncedCallback(updateKeyword, 200);

  return (
    <Group>
      <TextInput
        placeholder="Search questions"
        leftSection=<IconSearch size={16} stroke={1.5} />
        defaultValue={keyword}
        onChange={e => debounced(e.target.value)}
      />
    </Group>
  );
};

export default QuestionQueryBar;
