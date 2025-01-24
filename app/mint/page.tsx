'use client';

import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useRouter } from 'next/navigation';
import { TransactionReceipt } from 'viem';
import { Loader2 } from 'lucide-react';

export default function MintPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  const handleMintSuccess = (receipt?: TransactionReceipt) => {
    setMintSuccess(true);
    setIsLoading(false);
    // Could redirect to a success page or profile page
    setTimeout(() => {
      router.push('/researchcoin');
    }, 2000);
  };

  const handleMintError = (error: any) => {
    setError(error.message || 'Failed to mint NFT. Please try again.');
    setIsLoading(false);
  };

  const handleMintStatus = (status: string) => {
    if (status === 'minting') {
      setIsLoading(true);
      setError(null);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Mint ResearchHub NFT</h1>
            <p className="text-gray-600 mb-8">
              Support research and receive a unique NFT memento of your contribution
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {mintSuccess && (
            <Alert variant="success" className="mb-4">
              Successfully minted your ResearchHub NFT!
            </Alert>
          )}

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Minting your NFT...</span>
                </div>
              </div>
            )}

            <NFTMintCardDefault
              contractAddress="0xed2f34043387783b2727ff2799a46ce3ae1a34d2"
              tokenId="2"
              isSponsored={true}
              onError={handleMintError}
              onStatus={handleMintStatus}
              onSuccess={handleMintSuccess}
              className="border border-gray-200 rounded-lg shadow-sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <ResearchCoinIcon size={16} />
            <span>Powered by ResearchHub</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
