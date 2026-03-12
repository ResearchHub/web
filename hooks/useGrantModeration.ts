'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GrantModerationService } from '@/services/grant-moderation.service';
import { ID } from '@/types/root';

type ModerationAction = 'approving' | 'declining' | null;

interface UseGrantModerationReturn {
  moderationAction: ModerationAction;
  isDeclineModalOpen: boolean;
  openDeclineModal: () => void;
  closeDeclineModal: () => void;
  approveGrant: () => Promise<void>;
  declineGrant: (data: { reasonChoice: string; reason: string }) => Promise<void>;
}

export const useGrantModeration = (grantId: ID | undefined): UseGrantModerationReturn => {
  const [moderationAction, setModerationAction] = useState<ModerationAction>(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const router = useRouter();

  const approveGrant = useCallback(async () => {
    if (!grantId) return;
    setModerationAction('approving');
    try {
      await GrantModerationService.approveGrant(grantId);
      toast.success('RFP approved successfully');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve RFP');
    } finally {
      setModerationAction(null);
    }
  }, [grantId, router]);

  const declineGrant = useCallback(
    async (data: { reasonChoice: string; reason: string }) => {
      if (!grantId) return;
      setModerationAction('declining');
      try {
        await GrantModerationService.declineGrant(grantId, {
          reason_choice: data.reasonChoice,
          ...(data.reason && { reason: data.reason }),
        });
        toast.success('RFP declined');
        setIsDeclineModalOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to decline RFP');
      } finally {
        setModerationAction(null);
      }
    },
    [grantId, router]
  );

  const openDeclineModal = useCallback(() => setIsDeclineModalOpen(true), []);
  const closeDeclineModal = useCallback(() => setIsDeclineModalOpen(false), []);

  return {
    moderationAction,
    isDeclineModalOpen,
    openDeclineModal,
    closeDeclineModal,
    approveGrant,
    declineGrant,
  };
};
