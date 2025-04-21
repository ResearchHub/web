import { format, subDays } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';

export const formatDate = (date: Date): string => {
  return format(date, DATE_FORMAT);
};

export const getLastWeekRange = (): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, 7);
  return { start, end };
};

export const getLastMonthRange = (): { start: Date; end: Date } => {
  const end = new Date();
  const start = subDays(end, 30);
  return { start, end };
};

export const getLastYearRange = (): { start: Date; end: Date } => {
  // New implementation: last 365 days relative to today
  const end = new Date();
  const start = subDays(end, 365);
  return { start, end };
};
