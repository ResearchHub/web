/**
 * Utility functions for string manipulation
 */

/**
 * Truncates a string to a specified maximum length and adds an ellipsis if truncated
 * @param text The text to truncate
 * @param maxLength The maximum length of the text (default: 200)
 * @returns The truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Strips HTML tags from a string
 * @param html The HTML string to strip
 * @returns The plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .trim();
};

/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The string in title case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const pluralizeSuffix = (count: number): string => (count === 1 ? '' : 's');

/**
 * Converts a plural label to its singular form by removing the trailing 's'
 * @param label The plural label (e.g., "Supporters", "Contributors")
 * @returns The singular form (e.g., "Supporter", "Contributor")
 */
export const getSingularLabel = (label: string): string => {
  if (!label) return '';
  return label.replace(/s$/, '');
};

/**
 * Counts the number of words in a string
 * @param text The text to count words in
 * @returns The word count
 */
export const countWords = (text: string): number => {
  if (!text) return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

/**
 * Validates if a string is a valid Ethereum address format
 * @param address The address string to validate
 * @returns true if the address is a valid Ethereum address (0x followed by 40 hex characters)
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Masks an Ethereum address by showing only the first few and last few characters
 * @param address The address to mask (e.g., "0x1234567890abcdef1234567890abcdef12345678")
 * @param prefixLength The number of characters to show at the start (default: 6)
 * @param suffixLength The number of characters to show at the end (default: 4)
 * @returns The masked address (e.g., "0x1234...5678") or empty string if address is invalid
 */
export const maskAddress = (
  address: string | null | undefined,
  prefixLength: number = 6,
  suffixLength: number = 4
): string => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};
