/**
 * Base interface for all transformed objects that maintains access to raw data
 */
export interface BaseTransformed<T = any> {
  raw: T;
}

/**
 * Base transformer function type
 */
export type BaseTransformer<
  Input = any,
  Output extends BaseTransformed<Input> = BaseTransformed<Input>,
> = (raw: Input) => Output;

/**
 * Helper function to create a transformer that automatically includes the raw data
 */
export function createTransformer<Input, TransformedOutput>(
  transform: (raw: Input) => TransformedOutput
): (raw: Input) => TransformedOutput & BaseTransformed<Input> {
  return (raw: Input) => ({
    ...transform(raw),
    raw,
  });
}
