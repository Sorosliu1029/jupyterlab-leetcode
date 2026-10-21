const ADay = 24 * 60 * 60 * 1000; // milliseconds in a day

// submission count thresholds for heatmap levels 1..4
const LevelThresholds = [1, 7, 14, 20];

/**
 * Columns of UTC days, one column per week (Sunday first), ending today.
 * The last column is partial unless today is a Saturday.
 */
export const buildCalendarWeeks = (today: Date, weeks: number): Date[][] => {
  const end = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  const start = end - ((weeks - 1) * 7 + today.getUTCDay()) * ADay;
  const columns: Date[][] = [];
  for (let t = start; t <= end; t += ADay) {
    const d = new Date(t);
    if (d.getUTCDay() === 0) {
      columns.push([]);
    }
    columns[columns.length - 1].push(d);
  }
  return columns;
};

/**
 * Month labels placed on the first week column whose Sunday falls in a new month.
 */
export const getMonthLabels = (
  weeks: Date[][]
): { index: number; label: string }[] =>
  weeks
    .map((w, i) => ({ index: i, month: w[0].getUTCMonth(), date: w[0] }))
    .filter(
      ({ index, month }) =>
        index > 0 && month !== weeks[index - 1][0].getUTCMonth()
    )
    .map(({ index, date }) => ({
      index,
      label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    }));

export const getSubmissionLevel = (count: number): number =>
  LevelThresholds.filter(t => count >= t).length;

/**
 * LeetCode keys the calendar by UTC-midnight timestamps in seconds.
 */
export const getSubmissionCount = (
  calendar: Record<string, number>,
  day: Date
): number => calendar[day.getTime() / 1e3] ?? 0;
