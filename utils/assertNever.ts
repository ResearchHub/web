/**
 * Utility function for exhaustive type checking
 * @param value The value that should be of type never
 * @param shouldThrow Whether to throw an error (true) or just console.error (false)
 * @returns never
 */
export function assertNever(value: never, shouldThrow = false): never {
  const message = `Unexpected object: ${JSON.stringify(value)}`;

  if (shouldThrow) {
    throw new Error(message);
  } else {
    console.error(message);
    return value as never;
  }
}
