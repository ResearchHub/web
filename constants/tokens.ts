import { Token } from '@coinbase/onchainkit/token';

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const CHAIN_ID = IS_PRODUCTION
  ? 8453 // Base mainnet
  : 84532; // Base Sepolia testnet

export type NetworkType = 'BASE' | 'ETHEREUM';

export interface NetworkConfig {
  chainId: number;
  name: string;
  rscAddress: string;
  explorerUrl: string;
  badge: string;
  description: string;
  icon: string;
}

export const NETWORK_CONFIG: Record<NetworkType, NetworkConfig> = {
  BASE: {
    chainId: IS_PRODUCTION ? 8453 : 84532,
    name: IS_PRODUCTION ? 'Base' : 'Base Sepolia',
    rscAddress: IS_PRODUCTION
      ? '0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1'
      : '0xdAf43508D785939D6C2d97c2df73d65c9359dBEa',
    explorerUrl: IS_PRODUCTION ? 'https://basescan.org' : 'https://sepolia.basescan.org',
    badge: 'Lower Fees',
    description: 'Recommended network for low fees',
    icon: '/base-logo.svg',
  },
  ETHEREUM: {
    chainId: IS_PRODUCTION ? 1 : 11155111,
    name: IS_PRODUCTION ? 'Ethereum' : 'Sepolia',
    rscAddress: IS_PRODUCTION
      ? '0xd101dcc414f310268c37eeb4cd376ccfa507f571'
      : '0xEe8D932a66aDA39E4EF08046734F601D04B6a3DA',
    explorerUrl: IS_PRODUCTION ? 'https://etherscan.io' : 'https://sepolia.etherscan.io',
    badge: 'Higher Fees',
    description: 'Higher fees, with increased decentralization',
    icon: '/ethereum-logo.svg',
  },
};

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

/**
 * Get RSC token configuration for a specific network
 */
export function getRSCForNetwork(network: NetworkType): Token {
  const config = NETWORK_CONFIG[network];
  return {
    name: 'ResearchCoin',
    symbol: 'RSC',
    decimals: 18,
    address: config.rscAddress as `0x${string}`,
    image: 'RSC.webp',
    chainId: config.chainId,
  };
}

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
