'use client';

import { useState } from 'react';
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
    setIsApplyModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-gray-900  flex items-center gap-1">
          <span>$</span>
          {usdAmount.toLocaleString()}
          <span className="text-lg font-medium">USD</span>
        </div>
        {usdAmount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Amount may be divided across multiple proposals.
          </p>
        )}

        <Button
          onClick={() => setIsApplyModalOpen(true)}
          className="w-full mt-4 flex items-center justify-center gap-1"
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
