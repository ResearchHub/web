'use client';

import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
import { PageLayout } from '@/app/layouts/PageLayout';

export default function MintPage() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <h1 className="text-4xl font-bold mb-8">Mint ResearchHub NFT</h1>
        <div className="w-full max-w-md">
          <NFTMintCardDefault
            contractAddress="0xed2f34043387783b2727ff2799a46ce3ae1a34d2" //pre-deployed contract
            tokenId="2"
          />
        </div>
      </div>
    </PageLayout>
  );
}
