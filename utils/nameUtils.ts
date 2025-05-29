interface ParsedName {
  firstName: string;
  lastName: string;
}

/**
 * Parses a full name into first and last names
 * @param fullName The full name to parse
 * @returns An object containing first and last names
 * @throws Error if full name is required or if first and last names are not provided
 */
export function parseFullName(fullName: string): ParsedName {
  if (!fullName || fullName.trim() === '') {
    throw new Error('Full name is required');
  }

  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length < 2) {
    throw new Error('Please provide both first and last name');
  }

  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  return {
    firstName,
    lastName,
  };
}
