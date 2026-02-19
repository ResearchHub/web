'use client';

import { useState } from 'react';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { ProposalForModal } from '@/services/post.service';
import { Work } from '@/types/work';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GrantAmountSectionProps {
  work: Work;
}

export const GrantAmountSection = ({ work }: GrantAmountSectionProps) => {
  const usdAmount = work.note?.post?.grant?.amount?.usd ?? 0;
  const router = useRouter();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  if (!work.note?.post?.grant?.amount) {
    return null;
  }

  const handleUseSelectedProposal = (proposal: ProposalForModal) => {
    console.log('Apply using selected proposal from GrantAmountSection:', proposal);
    setIsApplyModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Funding</h3>
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-primary-600 min-w-0 flex-shrink truncate flex items-center gap-1">
              <span>$</span>
              {usdAmount.toLocaleString()}
              <span className="text-lg font-medium">USD</span>
            </div>
          </div>
        </div>
        {usdAmount > 0 && (
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Amount may be divided across multiple proposals.
          </p>
        )}

        <Button
          onClick={() => {
            setIsApplyModalOpen(true);
          }}
          className="w-full mt-3 flex items-center justify-center gap-1"
          size="lg"
        >
          <Plus className="h-4 w-4" /> Submit proposal
        </Button>
      </div>

      <ApplyToGrantModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onUseSelected={handleUseSelectedProposal}
        grantId={(work.note?.post?.grant?.id || 0).toString()}
      />
    </>
  );
};
