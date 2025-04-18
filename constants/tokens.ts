import { Token } from '@coinbase/onchainkit/token';

const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';
const CHAIN_ID = IS_PRODUCTION
  ? 8453 // Base mainnet
  : 84532; // Base Sepolia testnet

/**
 * ResearchHub Token (RSC) definition
 * @description The native token of the ResearchHub platform
 */
export const RSC: Token = {
  name: 'ResearchCoin',
  symbol: 'RSC',
  decimals: 18,
  address: IS_PRODUCTION
    ? '0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1'
    : '0xdAf43508D785939D6C2d97c2df73d65c9359dBEa',
  image: 'RSC.webp',
  chainId: CHAIN_ID,
};

export const TRANSFER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
