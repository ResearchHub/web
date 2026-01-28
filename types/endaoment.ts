/**
 * Endaoment DAF (Donor Advised Fund) account types
 */

export interface EndaomentDAFAccount {
  id: string;
  name: string;
  /** Balance in USD */
  balanceUsd: number;
}

export interface EndaomentUser {
  id: string;
  email: string;
  accounts: EndaomentDAFAccount[];
}
