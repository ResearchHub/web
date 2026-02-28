import { ApiClient } from '@/services/client';

/**
 * Initiates the connection process to Endaoment by obtaining an authorization URL.
 * The client should redirect the user to this URL to complete the connection.
 *
 * @param returnUrl The URL to which Endaoment should redirect after authorization.
 * @returns The authorization URL.
 * @throws ApiError if the request fails.
 */
export async function connectEndaomentAccount(returnUrl: string): Promise<string> {
  const response = await ApiClient.post<{ auth_url: string }>('/api/endaoment/connect/', {
    return_url: returnUrl,
  });

  return response.auth_url;
}

/**
 * Disconnects the user's Endaoment account from the application.
 */
export async function disconnectEndaomentAccount(): Promise<void> {
  await ApiClient.post('/api/endaoment/disconnect/');
}

interface EndaomentStatus {
  connected: boolean;
}

/**
 * Provides the connection status of the Endaoment account.
 */
export async function getEndaomentStatus(): Promise<EndaomentStatus> {
  const response = await ApiClient.get<{ connected: boolean }>('/api/endaoment/status/');
  return {
    connected: response.connected,
  };
}

export interface EndaomentFund {
  id: string;
  name: string;
  type: string;
  description: string;
  usdcBalance: string;
}

/**
 * Converts USDC micros to dollars.
 *
 * Round down to the nearest cent to avoid displaying amounts larger
 * than the actual balance. E.g., if the balance is 12345678 micros
 * (which is $123.45678), this will return "123.45".
 */
function microsToDollars(micros: string | number): string {
  const balanceInMicros = Number(micros) || 0;
  return (Math.floor(balanceInMicros / 10_000) / 100).toString();
}

/**
 * Calculates the effective available balance for a DAF.
 * This accounts for pending transactions that aren't yet reflected in usdcBalance.
 * It is needed because the Endaoment API's usdcBalance field does not account for pending donations.
 */
function getAvailableBalance(usdcBalance: string, lifetimeDonationsUsdc: string): number {
  return Number(usdcBalance) - Number(lifetimeDonationsUsdc);
}

/**
 * Transforms a raw Endaoment fund API response into an EndaomentFund.
 */
function transformEndaomentFund(raw: Record<string, any>): EndaomentFund {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    description: raw.description,
    usdcBalance: microsToDollars(getAvailableBalance(raw.usdcBalance, raw.lifetimeDonationsUsdc)),
  };
}

/**
 * Fetches the user's Endaoment funds.
 */
export async function getEndaomentFunds(): Promise<EndaomentFund[]> {
  const response = await ApiClient.get<Array<Record<string, any>>>('/api/endaoment/funds/');
  return response.map(transformEndaomentFund);
}
