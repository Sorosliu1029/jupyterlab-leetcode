import React, { useState } from 'react';
import { Badge, MultiSelect, MultiSelectProps } from '@mantine/core';
import { IconCheck, IconCheckbox } from '@tabler/icons-react';
import { StatusColors } from './QuestionItem';
import classes from '../styles/LeetCodeMain.module.css';

const CheckedIcon = <IconCheck size={12} stroke={1.5} />;

const Data = Object.keys(StatusColors).map(s => ({
  value: s,
  label: s.replace('_', '').toLowerCase()
}));

const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({
  option,
  checked
}) => (
  <Badge
    leftSection={checked ? CheckedIcon : null}
    color={StatusColors[option.value] || 'blue'}
    variant="light"
    tt="capitalize"
  >
    {option.label}
  </Badge>
);

const QuestionStatusFilter: React.FC<{
  updateStatuses: (statues: string[]) => void;
}> = ({ updateStatuses }) => {
  const [selected, setSelected] = useState(false);

  return (
    <MultiSelect
      tt="capitalize"
      data={Data}
      renderOption={renderMultiSelectOption}
      maxDropdownHeight={300}
      placeholder="Status"
      checkIconPosition="left"
      leftSection={<IconCheckbox size={16} stroke={1.5} />}
      leftSectionPointerEvents="none"
      clearable
      searchable
      onChange={v => {
        setSelected(v.length > 0);
        updateStatuses(v);
      }}
      className={
        selected ? classes.filter_selected : classes.status_filter_empty
      }
    />
  );
};

export default QuestionStatusFilter;
