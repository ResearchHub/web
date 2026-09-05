let idCounter = 0;

/**
 * Ids only need to be unique within a session; `crypto.randomUUID` isn't
 * available in every browser the demo may run on.
 */
export const createId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
};
