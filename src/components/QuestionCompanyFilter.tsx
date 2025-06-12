import React, { useState } from 'react';
import { Badge, MultiSelect, MultiSelectProps } from '@mantine/core';
import { IconBuildings, IconCheck } from '@tabler/icons-react';
import classes from '../styles/Filter.module.css';

const CheckedIcon = <IconCheck size={12} stroke={1.5} />;

const Data = ['facebook', 'google'];

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
}> = ({ updateCompanies }) => {
  const [selected, setSelected] = useState(false);

  return (
    <MultiSelect
      tt="capitalize"
      data={Data}
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
      className={selected ? classes.filter_selected : classes.filter_empty}
    />
  );
};

export default QuestionCompanyFilter;
