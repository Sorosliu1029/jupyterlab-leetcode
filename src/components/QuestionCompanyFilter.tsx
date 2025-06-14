import React, { useEffect, useState } from 'react';
import { Badge, MultiSelect, MultiSelectProps, Tooltip } from '@mantine/core';
import { IconBuildings, IconCheck } from '@tabler/icons-react';
import classes from '../styles/LeetCodeMain.module.css';
import { LeetCodeCompanyTag } from '../types/leetcode';
import { getAllCompanies } from '../services/leetcode';

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
    {option.value}
  </Badge>
);

const QuestionCompanyFilter: React.FC<{
  updateCompanies: (companies: string[]) => void;
  isPremium?: boolean;
}> = ({ updateCompanies, isPremium }) => {
  const [selected, setSelected] = useState(false);
  const [allCompanies, setAllCompanies] = useState<LeetCodeCompanyTag[]>([]);

  useEffect(() => {
    getAllCompanies().then(cs => setAllCompanies(cs));
  }, []);

  const options = allCompanies.map(c => ({
    value: c.slug,
    label: c.name
  }));
  const disabled = isPremium === false;
  const ms = (
    <MultiSelect
      tt="capitalize"
      data={options}
      renderOption={renderMultiSelectOption}
      maxDropdownHeight={300}
      placeholder="Company"
      checkIconPosition="left"
      leftSection={<IconBuildings size={16} stroke={1.5} />}
      leftSectionPointerEvents="none"
      clearable
      searchable
      onChange={v => {
        setSelected(v.length > 0);
        updateCompanies(v);
      }}
      className={
        selected ? classes.filter_selected : classes.company_filter_empty
      }
      disabled={disabled}
    />
  );

  return disabled ? (
    <Tooltip label="Company filter is only available for LeetCode Premium users.">
      {ms}
    </Tooltip>
  ) : (
    ms
  );
};

export default QuestionCompanyFilter;
