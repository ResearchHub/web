import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);

/**
 * Converts an ISO timestamp to a relative time string (e.g. "2h ago")
 * @param timestamp ISO timestamp string
 * @param withoutSuffix Optional boolean to show the relative time without the suffix (e.g. "2h")
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: string, withoutSuffix?: boolean): string {
  return dayjs(timestamp).fromNow(withoutSuffix);
}

/**
 * Checks if a timestamp is within the last 24 hours
 * @param timestamp ISO timestamp string
 * @returns boolean
 */
export function isWithin24Hours(timestamp: string): boolean {
  const now = dayjs();
  const time = dayjs(timestamp);
  return now.diff(time, 'hour') < 24;
}

/**
 * Formats a timestamp based on how recent it is
 * If within 24 hours: shows relative time (e.g. "2h ago")
 * If older: shows date (e.g. "Dec 15, 2024")
 */
export function formatTimestamp(timestamp: string): string {
  if (isWithin24Hours(timestamp)) {
    return formatTimeAgo(timestamp);
  }
  return dayjs(timestamp).format('MMM D, YYYY');
}

/**
 * Formats a deadline timestamp into a human-readable string
 * @param deadline ISO timestamp string
 * @returns Formatted deadline string (e.g. "Ended", "Ends today", "5 days left", etc.)
 */
export function formatDeadline(deadline: string): string {
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  const diffDays = deadlineDate.diff(now, 'day');

  if (diffDays < 0) {
    return 'Ended';
  } else if (diffDays === 0) {
    return 'Ends today';
  } else if (diffDays === 1) {
    return 'Ends tomorrow';
  } else if (diffDays < 30) {
    return `${diffDays} days left`;
  } else {
    return `Ends ${formatTimestamp(deadline)}`;
  }
}

export function specificTimeSince(dateInput: string | Date): string {
  const now = dayjs.utc();
  const joined = dayjs.utc(dateInput);

  // If the date is in the future, swap so we always count up
  const from = joined.isAfter(now) ? now : joined;
  const to = joined.isAfter(now) ? joined : now;

  let years = to.diff(from, 'year');
  let afterYears = from.add(years, 'year');

  let months = to.diff(afterYears, 'month');
  let afterMonths = afterYears.add(months, 'month');

  let days = to.diff(afterMonths, 'day');

  let result = [];
  if (years > 0) result.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) result.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);

  if (result.length === 0) {
    return 'just joined';
  } else if (result.length === 1) {
    return result[0];
  } else if (result.length === 2) {
    return `${result[0]} and ${result[1]}`;
  } else {
    return `${result[0]}, ${result[1]} and ${result[2]}`;
  }
}
