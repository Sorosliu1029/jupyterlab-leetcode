import React, { useState } from 'react';
import { Badge, MultiSelect, MultiSelectProps } from '@mantine/core';
import { IconCheck, IconTags } from '@tabler/icons-react';
import classes from '../styles/Filter.module.css';

const CheckedIcon = <IconCheck size={12} stroke={1.5} />;

const Data = ['array', 'hash-table'];

const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({
  option,
  checked
}) => (
  <Badge
    leftSection={checked ? CheckedIcon : null}
    color="blue"
    variant="light"
    tt="capitalize"
  >
    {option.value}
  </Badge>
);

const QuestionTopicFilter: React.FC<{
  updateTopics: (topics: string[]) => void;
}> = ({ updateTopics }) => {
  const [selected, setSelected] = useState(false);

  return (
    <MultiSelect
      tt="capitalize"
      data={Data}
      renderOption={renderMultiSelectOption}
      maxDropdownHeight={300}
      placeholder="Topic"
      checkIconPosition="left"
      leftSection={<IconTags size={16} stroke={1.5} />}
      leftSectionPointerEvents="none"
      clearable
      searchable
      onChange={v => {
        setSelected(v.length > 0);
        updateTopics(v);
      }}
      className={selected ? classes.filter_selected : classes.filter_empty}
    />
  );
};

export default QuestionTopicFilter;
