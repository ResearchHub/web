import { transformUser, TransformedUser } from './user';
import { BaseTransformer } from './transformer';

export interface Tip {
  user: TransformedUser;
  amount: number;
  raw: any;
}

export const transformTip: BaseTransformer<any, Tip> = (raw) => {
  if (!raw || !raw.user || !raw.amount) {
    console.error('Invalid raw tip data:', raw);
    // Handle invalid data appropriately, maybe return null or throw an error
    // For now, returning a default structure or null might be safer
    // Depending on how downstream code handles potential nulls.
    // Throwing an error might be better if tips are critical.
    throw new Error('Invalid tip data received');
  }

  return {
    user: transformUser(raw.user),
    // Ensure amount is parsed as a number
    amount: parseFloat(raw.amount),
    raw,
  };
};
