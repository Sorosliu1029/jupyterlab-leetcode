import { Paper, PaperProps, Stack, Table, Tooltip } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { getSubmissionCalendar } from '../services/leetcode';
import classes from '../styles/LeetCodeMain.module.css';
import { useScrollIntoView } from '@mantine/hooks';

const ADay = 24 * 60 * 60 * 1000; // milliseconds in a day
const ShowWeeks = 52;

const today = new Date();
const dates = Array(ShowWeeks * 7 + today.getUTCDay() + 1) // ensure table columns aligned
  .fill(0)
  .map((_, i) => new Date(today.getTime() - i * ADay));
const months = Array.from(
  new Map(
    dates.map(d => [d.getUTCFullYear() * 100 + d.getUTCMonth(), d])
  ).entries()
).sort(([a], [b]) => a - b);
const monthHead = (
  <Table.Thead>
    <Table.Tr h={13}>
      {months.map(([k, d], i) => {
        return (
          <Table.Td key={k} ta="left" fz="xs" colSpan={i === 6 ? 5 : 4}>
            <span>{d.toDateString().slice(4, 7)}</span>
          </Table.Td>
        );
      })}
    </Table.Tr>
  </Table.Thead>
);

const byDayOfWeek = Array(7)
  .fill(null)
  .map(() => [] as Date[]);
dates.forEach(d => byDayOfWeek[d.getUTCDay()].push(d));
byDayOfWeek.forEach(ds => ds.sort((a, b) => a.getTime() - b.getTime()));
const getDayOfWeekRows = (
  submissionCalendar: Record<string, number>,
  ds: Date[],
  i: number,
  scrollToRef: React.RefObject<any>
) => {
  return (
    <Table.Tr key={`tr-${i}`} h={10}>
      {ds.map(d => {
        const ts = new Date(d).setUTCHours(0, 0, 0, 0) / 1e3;
        const cnt = submissionCalendar[ts] ?? 0;
        return (
          <Tooltip
            key={ts}
            label={`${cnt} submission${cnt > 1 ? 's' : ''} on ${d.toDateString().slice(4)}`}
          >
            <Table.Td
              className={classes.cell}
              bg={
                SubmissionColors.find(i => cnt >= i.cnt)?.color ?? DefaultColor
              }
              ref={d.getTime() === today.getTime() ? scrollToRef : undefined}
            ></Table.Td>
          </Tooltip>
        );
      })}
    </Table.Tr>
  );
};

const SubmissionColors = [
  { cnt: 20, color: '#196127' },
  { cnt: 14, color: '#239a3b' },
  { cnt: 7, color: '#7bc96f' },
  { cnt: 1, color: '#c6e48b' }
];
const DefaultColor = '#ebeef6';

const SubmissionCalendar: React.FC<{
  username?: string;
  paperProps: PaperProps;
}> = ({ username, paperProps }) => {
  const [submissionCalendar, setSubmissionCalendar] = useState<
    Record<string, number>
  >({});
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLTableDataCellElement,
    HTMLDivElement
  >({
    axis: 'x'
  });

  useEffect(() => {
    if (!username) {
      return;
    }
    getSubmissionCalendar(username).then(d => {
      setSubmissionCalendar(JSON.parse(d.submissionCalendar));
      scrollIntoView();
    });
  }, [username]);

  return (
    <Paper {...paperProps}>
      <Stack>
        <Table.ScrollContainer minWidth="10%" type="native" ref={scrollableRef}>
          <Table className={classes.table}>
            {monthHead}
            <Table.Tbody>
              {byDayOfWeek.map((ds, i) =>
                getDayOfWeekRows(submissionCalendar, ds, i, targetRef)
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Stack>
    </Paper>
  );
};

export default SubmissionCalendar;
