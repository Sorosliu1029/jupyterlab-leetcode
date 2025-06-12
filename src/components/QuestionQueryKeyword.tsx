import React from 'react';
import { Group, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedCallback } from '@mantine/hooks';

const QuestionQueryBar: React.FC<{
  updateKeyword: (keyword: string) => void;
}> = ({ updateKeyword }) => {
  const debounced = useDebouncedCallback(updateKeyword, 200);

  return (
    <Group>
      <TextInput
        placeholder="Search questions"
        leftSection=<IconSearch size={16} stroke={1.5} />
        onChange={e => debounced(e.target.value)}
      />
    </Group>
  );
};

export default QuestionQueryBar;
