import React from 'react';
import { Stack, Text } from '@mantine/core';

const DifficultyStatistics: React.FC<{ text: string; color: string }> = ({
  text,
  color
}) => {
  return (
    <Stack>
      <Text>{text.charAt(0).toUpperCase() + text.slice(1)}</Text>
    </Stack>
  );
};

export default DifficultyStatistics;
