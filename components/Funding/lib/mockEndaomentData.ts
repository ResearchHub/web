import { EndaomentDAFAccount } from '@/types/endaoment';

/**
 * Mock DAF accounts for development/testing.
 * In production, these would be fetched from Endaoment API after authentication.
 */
export const MOCK_DAF_ACCOUNTS: EndaomentDAFAccount[] = [
  { id: 'daf-1', name: 'Primary DAF', balanceUsd: 5000 },
  { id: 'daf-2', name: 'Research Fund', balanceUsd: 250 },
  { id: 'daf-3', name: 'Science Giving', balanceUsd: 50 },
  { id: 'daf-4', name: 'Family Foundation', balanceUsd: 15000 },
];
