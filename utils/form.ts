import { FieldError, FieldErrors } from 'react-hook-form';

/**
 * Extracts a readable error message from React Hook Form errors
 * Works with various error structures including nested and array errors
 *
 * @param error The error object from React Hook Form
 * @param fallbackMessage Optional fallback message if error exists but no message is found
 * @returns A string error message or undefined if no error
 */
export function getFieldErrorMessage(
  error: FieldError | FieldErrors | undefined,
  fallbackMessage = 'Invalid input'
): string | undefined {
  if (!error) return undefined;

  // Handle array of errors
  if (Array.isArray(error)) {
    const messages = error
      .map((err) => err?.message)
      .filter(Boolean)
      .join(', ');
    return messages || fallbackMessage;
  }

  // Handle error with message property
  if (typeof error === 'object' && 'message' in error && error.message) {
    return error.message.toString();
  }

  // Handle nested errors (recursively)
  if (typeof error === 'object' && Object.keys(error).length > 0) {
    // Try to find any message in nested errors
    for (const key in error) {
      const nestedError = error[key as keyof typeof error];
      const nestedMessage = getFieldErrorMessage(
        nestedError as FieldError | FieldErrors,
        undefined // Don't use fallback for nested calls to avoid duplicates
      );
      if (nestedMessage) return nestedMessage;
    }
    return fallbackMessage;
  }

  // Fallback for any other error structure
  return error.toString() || fallbackMessage;
}
