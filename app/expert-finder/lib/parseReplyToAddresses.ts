import { isValidEmail } from '@/utils/validation';

export const REPLY_TO_MIN = 1;
export const REPLY_TO_MAX = 10;

export function parseReplyToAddresses(input: string): string[] {
  return input
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function validateReplyToAddresses(
  emails: string[]
): { valid: true } | { valid: false; error: string } {
  if (emails.length < REPLY_TO_MIN) {
    return { valid: false, error: 'Please enter at least one Reply To email address.' };
  }
  if (emails.length > REPLY_TO_MAX) {
    return { valid: false, error: `You can add at most ${REPLY_TO_MAX} Reply To addresses.` };
  }
  const invalid = emails.find((email) => !isValidEmail(email));
  if (invalid != null) {
    return { valid: false, error: `"${invalid}" is not a valid email address.` };
  }
  return { valid: true };
}

export function parseAndValidateReplyToInput(
  input: string
): { valid: true; emails: string[] } | { valid: false; error: string } {
  const emails = parseReplyToAddresses(input);
  const result = validateReplyToAddresses(emails);
  if (!result.valid) return result;
  return { valid: true, emails };
}
