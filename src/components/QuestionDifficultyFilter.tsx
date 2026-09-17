import React from 'react';
import { Badge, MultiSelect, MultiSelectProps } from '@mantine/core';
import { IconCheck, IconGauge } from '@tabler/icons-react';
import { DifficultyColors } from './Statistics';
import classes from '../styles/LeetCodeMain.module.css';

const CheckedIcon = <IconCheck size={12} stroke={1.5} />;

const Data = Object.keys(DifficultyColors);

const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({
  option,
  checked
}) => (
  <Badge
    leftSection={checked ? CheckedIcon : null}
    color={DifficultyColors[option.value.toLowerCase()] || 'blue'}
    variant="light"
    tt="capitalize"
  >
    {option.value}
  </Badge>
);

const QuestionDifficultyFilter: React.FC<{
  updateDifficulties: (ds: string[]) => void;
  difficulties: string[];
}> = ({ updateDifficulties, difficulties }) => {
  return (
    <MultiSelect
      tt="capitalize"
      data={Data}
      renderOption={renderMultiSelectOption}
      maxDropdownHeight={300}
      placeholder="Difficulty"
      checkIconPosition="left"
      leftSection={<IconGauge size={16} stroke={1.5} />}
      leftSectionPointerEvents="none"
      clearable
      searchable
      value={difficulties.map(difficulty => difficulty.toLowerCase())}
      onChange={v => {
        updateDifficulties(v.map(v => v.toUpperCase()));
      }}
      className={
        difficulties.length > 0
          ? classes.filter_selected
          : classes.difficulty_filter_empty
      }
    />
  );
};

export default QuestionDifficultyFilter;
