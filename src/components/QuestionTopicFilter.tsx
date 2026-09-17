import React, { useEffect, useState } from 'react';
import { Badge, MultiSelect, MultiSelectProps } from '@mantine/core';
import { IconCheck, IconTags } from '@tabler/icons-react';
import classes from '../styles/LeetCodeMain.module.css';
import { getAllTopics } from '../services/leetcode';
import { LeetCodeTopicTag } from '../types/leetcode';

const CheckedIcon = <IconCheck size={12} stroke={1.5} />;

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
    {option.label}
  </Badge>
);

const QuestionTopicFilter: React.FC<{
  updateTopics: (topics: string[]) => void;
  topics: string[];
}> = ({ updateTopics, topics }) => {
  const [allTopics, setAllTopics] = useState<LeetCodeTopicTag[]>([]);

  useEffect(() => {
    getAllTopics().then(ts => setAllTopics(ts));
  }, []);

  const options = allTopics.map(t => ({
    value: t.slug,
    label: t.name
  }));

  return (
    <MultiSelect
      tt="capitalize"
      data={options}
      renderOption={renderMultiSelectOption}
      maxDropdownHeight={300}
      placeholder="Topic"
      checkIconPosition="left"
      leftSection={<IconTags size={16} stroke={1.5} />}
      leftSectionPointerEvents="none"
      clearable
      searchable
      value={topics}
      onChange={v => {
        updateTopics(v);
      }}
      className={
        topics.length > 0 ? classes.filter_selected : classes.topic_filter_empty
      }
    />
  );
};

export default QuestionTopicFilter;
