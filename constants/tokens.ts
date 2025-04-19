import { Token } from '@coinbase/onchainkit/token';

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const CHAIN_ID = IS_PRODUCTION
  ? 8453 // Base mainnet
  : 84532; // Base Sepolia testnet

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

export const ETH: Token = {
  name: 'ETH',
  address: '',
  symbol: 'ETH',
  decimals: 18,
  image: 'ETH.webp',
  chainId: CHAIN_ID,
};

export const USDC: Token = {
  name: 'USDC',
  address: IS_PRODUCTION
    ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    : '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  symbol: 'USDC',
  decimals: 6,
  image: 'USDC.webp',
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
