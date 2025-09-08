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
 * Gets terminology mapping for different deadline types
 */
function getTerminology(type: 'bounty' | 'grant') {
  return {
    pastTense: type === 'grant' ? 'Closed' : 'Ended',
    presentTense: type === 'grant' ? 'Closes' : 'Ends',
    pastToday: type === 'grant' ? 'Closed today' : 'Ended today',
    presentToday: type === 'grant' ? 'Closes today' : 'Ends today',
    presentTomorrow: type === 'grant' ? 'Closes tomorrow' : 'Ends tomorrow',
  };
}

/**
 * Formats countdown for same-day deadlines
 */
function formatSameDayCountdown(
  deadlineDate: dayjs.Dayjs,
  now: dayjs.Dayjs,
  terminology: ReturnType<typeof getTerminology>
): string {
  const diffMs = deadlineDate.diff(now);
  if (diffMs < 0) {
    return terminology.pastToday;
  }

  const diffHours = deadlineDate.diff(now, 'hour');
  const diffMinutes = deadlineDate.diff(now, 'minute');

  // Show countdown for same-day deadlines within 24 hours
  if (diffHours >= 0 && diffHours < 24) {
    if (diffHours === 0) {
      return `${terminology.presentTense} in ${diffMinutes}m`;
    }
    return `${terminology.presentTense} in ${diffHours}h`;
  }

  return terminology.presentToday;
}

/**
 * Formats a deadline timestamp into a human-readable countdown string
 *
 * This function provides consistent deadline formatting across the application,
 * supporting both bounty and grant terminology with appropriate countdown displays.
 *
 * @param deadline ISO timestamp string of the deadline
 * @param type Type of deadline - 'bounty' or 'grant' (default: 'bounty')
 * @returns Formatted deadline string with countdown logic:
 *   - Under 1 hour: Shows minutes (e.g., "Closes in 30m")
 *   - 1-23 hours: Shows hours (e.g., "Closes in 3h")
 *   - 1 day: Shows "Closes tomorrow"
 *   - 2-29 days: Shows "X days left"
 *   - 30+ days: Shows full date
 *   - Past deadline: Shows "Closed" or "Ended"
 */
export function formatDeadline(deadline: string, type: 'bounty' | 'grant' = 'bounty'): string {
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  const diffDays = deadlineDate.diff(now, 'day');
  const terminology = getTerminology(type);

  // Handle past deadlines
  if (diffDays < 0) {
    return terminology.pastTense;
  }

  // Handle same-day deadlines
  if (diffDays === 0) {
    return formatSameDayCountdown(deadlineDate, now, terminology);
  }

  // Handle future deadlines
  if (diffDays === 1) {
    return terminology.presentTomorrow;
  }

  if (diffDays < 30) {
    return `${diffDays} days left`;
  }

  // Long-term deadlines: show full date
  return `${terminology.presentTense} ${formatTimestamp(deadline)}`;
}

/**
 * Checks if a deadline is in the future
 * @param deadline ISO timestamp string
 * @returns boolean indicating if the deadline is in the future
 */
export function isDeadlineInFuture(deadline: string): boolean {
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  return deadlineDate.isAfter(now);
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

/**
 * Formats a deadline timestamp into a human-readable string with exact time
 * @param deadline ISO timestamp string
 * @returns Formatted deadline string (e.g. "Dec 15, 2024 at 12:00 PM")
 */
export const formatExactTime = (deadline: string): string => {
  return dayjs(deadline).format('MMM D, YYYY [at] h:mm A');
};
