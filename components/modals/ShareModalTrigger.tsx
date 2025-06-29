'use client';

import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/icons/Icon';
import { useShareModalContext } from '@/contexts/ShareContext';

export default function ShareModalTrigger() {
  const { showShareModal } = useShareModalContext();

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[9998]">
        <Button
          onClick={() =>
            showShareModal({
              url: 'https://researchhub.com/experiment/ai-drug-discovery',
              docTitle: 'AI-Powered Drug Discovery',
              action: 'USER_FUNDED_PROPOSAL',
            })
          }
          className="rounded-full !h-14 !w-14"
        >
          <Icon name="socialMedia" size={24} color="white" />
        </Button>
      </div>
    </>
  );
}
