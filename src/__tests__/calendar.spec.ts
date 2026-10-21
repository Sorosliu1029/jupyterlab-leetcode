import {
  buildCalendarWeeks,
  getMonthLabels,
  getSubmissionCount,
  getSubmissionLevel
} from '../services/calendar';

describe('submission calendar', () => {
  // a Tuesday
  const today = new Date(Date.UTC(2026, 9, 20, 15, 30));

  it('builds Sunday-first week columns ending today', () => {
    const weeks = buildCalendarWeeks(today, 52);

    expect(weeks).toHaveLength(52);
    weeks.forEach(w => expect(w[0].getUTCDay()).toBe(0));
    weeks.slice(0, -1).forEach(w => expect(w).toHaveLength(7));
    expect(weeks[51]).toHaveLength(3);
    expect(weeks[51][2].getTime()).toBe(Date.UTC(2026, 9, 20));
  });

  it('labels the first column of each new month', () => {
    // Sundays: Sep 6, 13, 20, 27, Oct 4, 11, 18
    const weeks = buildCalendarWeeks(today, 7);

    expect(getMonthLabels(weeks)).toEqual([{ index: 4, label: 'Oct' }]);
  });

  it('maps submission counts to heatmap levels', () => {
    expect([0, 1, 6, 7, 13, 14, 19, 20, 99].map(getSubmissionLevel)).toEqual([
      0, 1, 1, 2, 2, 3, 3, 4, 4
    ]);
  });

  it('reads counts keyed by UTC-midnight seconds', () => {
    const day = new Date(Date.UTC(2026, 9, 20));
    const calendar = { [String(day.getTime() / 1e3)]: 3 };

    expect(getSubmissionCount(calendar, day)).toBe(3);
    expect(getSubmissionCount(calendar, new Date(Date.UTC(2026, 9, 19)))).toBe(
      0
    );
  });
});
