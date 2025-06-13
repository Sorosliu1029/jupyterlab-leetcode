import React from 'react';
import { Stack, Text } from '@mantine/core';

const DifficultyStatistics: React.FC<{
  text: string;
  color: string;
  solved: number;
  total: number;
  onHover: () => void;
  onLeave: () => void;
}> = ({ text, color, solved, total, onHover, onLeave }) => {
  return (
    <Stack bg="#FAFAFA" onMouseOver={onHover} onMouseLeave={onLeave} gap={0}>
      <Text tt="capitalize" c={color} size="xs" ta="center" fw="bolder">
        {text}
      </Text>
      <Text size="xs" fw="bold" ta="center">
        {solved}/{total}
      </Text>
    </Stack>
  );
};

export default DifficultyStatistics;
