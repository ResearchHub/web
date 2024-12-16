import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

/**
 * Converts an ISO timestamp to a relative time string (e.g. "2h ago")
 * @param timestamp ISO timestamp string
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: string): string {
  return dayjs(timestamp).fromNow();
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