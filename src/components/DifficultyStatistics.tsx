import React from 'react';
import { Stack, Text } from '@mantine/core';

const DifficultyStatistics: React.FC<{ text: string; color: string }> = ({
  text,
  color
}) => {
  return (
    <Stack>
      <Text tt="capitalize">{text}</Text>
    </Stack>
  );
};

export default DifficultyStatistics;
