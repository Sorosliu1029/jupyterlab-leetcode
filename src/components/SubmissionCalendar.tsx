import React, { useEffect, useRef, useState } from 'react';
import { getSubmissionCalendar } from '../services/leetcode';
import {
  buildCalendarWeeks,
  getMonthLabels,
  getSubmissionCount,
  getSubmissionLevel
} from '../services/calendar';
import classes from '../styles/LeetCodeMain.module.css';

const ShowWeeks = 52;
const CellSize = 11;
const CellGap = 3;
const MonthHeight = 14;
const LevelOpacities = [0, 0.3, 0.55, 0.8, 1];

const weeks = buildCalendarWeeks(new Date(), ShowWeeks);
const monthLabels = getMonthLabels(weeks);
const step = CellSize + CellGap;
const width = weeks.length * step - CellGap;
const height = MonthHeight + 7 * step - CellGap;

const SubmissionCalendar: React.FC<{ username?: string }> = ({ username }) => {
  const [submissionCalendar, setSubmissionCalendar] = useState<
    Record<string, number>
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) {
      return;
    }
    getSubmissionCalendar(username).then(d =>
      setSubmissionCalendar(JSON.parse(d.submissionCalendar))
    );
  }, [username]);

  // keep the most recent weeks in view when the panel is narrow
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [submissionCalendar]);

  const total = weeks
    .flat()
    .reduce((s, d) => s + getSubmissionCount(submissionCalendar, d), 0);

  return (
    <div className={classes.heat}>
      <div className={classes.heat_scroll} ref={scrollRef}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Submission heatmap for the past year"
        >
          {monthLabels.map(({ index, label }) => (
            <text
              key={index}
              x={index * step}
              y={MonthHeight - 4}
              className={classes.heat_month}
            >
              {label}
            </text>
          ))}
          {weeks.map((days, x) =>
            days.map(d => {
              const cnt = getSubmissionCount(submissionCalendar, d);
              const level = getSubmissionLevel(cnt);
              return (
                <rect
                  key={d.getTime()}
                  x={x * step}
                  y={MonthHeight + d.getUTCDay() * step}
                  width={CellSize}
                  height={CellSize}
                  rx={2}
                  className={level ? classes.heat_filled : classes.heat_empty}
                  fillOpacity={level ? LevelOpacities[level] : undefined}
                >
                  <title>
                    {`${cnt} submission${cnt === 1 ? '' : 's'} on ${d.toDateString().slice(4)}`}
                  </title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
      <div className={classes.caption}>
        {total} submission{total === 1 ? '' : 's'} in the past year
      </div>
    </div>
  );
};

export default SubmissionCalendar;
