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
            contractAddress="0xd9145CCE52D386f254917e481eB44e9943F39138"
            tokenId="2"
          />
        </div>
      </div>
    </PageLayout>
  );
}
