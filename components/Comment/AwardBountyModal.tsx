import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useMemo, useEffect } from 'react';
import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentFeed } from './CommentFeed';
import { Modal } from '@/components/ui/form/Modal';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Progress } from '@/components/ui/Progress';
import { formatRSC } from '@/utils/number';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/utils/styles';
import { BountyService } from '@/services/bounty.service';
import { toast } from 'react-hot-toast';
import { hasBounties, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { CommentProvider, useComments } from '@/contexts/CommentContext';
import CommentList from './CommentList';
import { CommentItem } from './CommentItem';
import { CommentCard } from './CommentCard';
import { contentRenderers } from '@/components/Feed/registry';

interface AwardBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment;
  contentType: ContentType;
  onBountyUpdated?: () => void;
}

// Custom component to filter out comments with bounties
const FilteredCommentFeed = ({
  documentId,
  contentType,
}: {
  documentId: number;
  contentType: ContentType;
}) => {
  const { filteredComments, loading, count } = useComments();

  // Filter out comments that have bounties
  const commentsWithoutBounties = useMemo(() => {
    return filteredComments.filter((comment) => !hasBounties(comment));
  }, [filteredComments]);

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading comments...</div>;
  }

  if (commentsWithoutBounties.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No comments available to award.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredComments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-4">
          <div className="flex-grow">
            <CommentItem
              comment={comment}
              contentType={contentType}
              renderCommentActions={false}
              debug={false}
            />
          </div>
          {/* Award actions */}
          <div className="flex-shrink-0 flex flex-col space-y-2 pt-2">
            {/* ... existing award actions ... */}
          </div>
        </div>
      ))}
    </div>
  );
};

export const AwardBountyModal = ({
  isOpen,
  onClose,
  comment,
  contentType,
  onBountyUpdated,
}: AwardBountyModalProps) => {
  const [awardAmounts, setAwardAmounts] = useState<Record<number, number>>({});
  const [selectedPercentages, setSelectedPercentages] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forceRefresh } = useComments();

  // Get the total bounty amount available to award
  const activeBounty = comment.bounties?.find(isOpenBounty);
  const totalBountyAmount = activeBounty ? parseFloat(activeBounty.totalAmount) : 0;

  // Calculate total amount awarded and remaining
  const totalAwarded = useMemo(() => {
    return Object.values(awardAmounts).reduce((sum, amount) => sum + (amount || 0), 0);
  }, [awardAmounts]);

  const remainingAmount = totalBountyAmount - totalAwarded;
  const percentageAwarded = (totalAwarded / totalBountyAmount) * 100;
  const isExactlyHundredPercent = Math.abs(percentageAwarded - 100) < 0.01; // Account for floating point precision
  const isOverAllocated = percentageAwarded > 100;

  const handleSubmitAwards = async () => {
    if (!isExactlyHundredPercent) {
      return; // Don't allow submission unless exactly 100% is allocated
    }

    setIsSubmitting(true);
    try {
      if (!activeBounty) {
        throw new Error('No active bounty found');
      }

      // Convert award amounts to the expected format
      const awards = Object.entries(awardAmounts).map(([commentId, amount]) => ({
        commentId: parseInt(commentId),
        amount,
      }));

      await BountyService.awardBounty(activeBounty.id, awards);
      toast.success('Bounty awards submitted successfully');

      // Force refresh the comments to update the UI
      try {
        // Try to use the context's forceRefresh if available
        await forceRefresh?.();

        // Also call the onBountyUpdated callback if provided
        if (onBountyUpdated) {
          onBountyUpdated();
        }
      } catch (refreshError) {
        console.error('Failed to refresh comments:', refreshError);

        // Fall back to the callback if the context refresh fails
        if (onBountyUpdated) {
          onBountyUpdated();
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit awards:', error);
      if (error instanceof Error && error.message.includes('No valid awards found')) {
        toast.error('Please ensure at least one award has an amount greater than 0');
      } else {
        toast.error('Failed to submit awards. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageClick = (commentId: number, percentage: number) => {
    const amount = (totalBountyAmount * percentage) / 100;
    setAwardAmounts((prev) => ({
      ...prev,
      [commentId]: amount,
    }));
    setSelectedPercentages((prev) => ({
      ...prev,
      [commentId]: percentage,
    }));
  };

  const handleCustomAmount = (commentId: number, value: number) => {
    setAwardAmounts((prev) => ({
      ...prev,
      [commentId]: value,
    }));
    // Clear selected percentage when custom amount is entered
    setSelectedPercentages((prev) => ({
      ...prev,
      [commentId]: 0,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Award Bounty">
      <div className="space-y-6 p-6">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <CommentItem comment={comment} contentType={contentType} renderCommentActions={false} />
        </div>
        <div className="text-sm text-gray-600">
          <p>Select which comments to award the bounty to:</p>
        </div>
      </div>

      <div className="border-t border-gray-200 p-6">
        <div className="max-h-96 overflow-y-auto">
          <FilteredCommentFeed documentId={comment.thread.objectId} contentType={contentType} />
        </div>
      </div>

      {/* Award summary bar */}
      <div className="flex-shrink-0 border-t bg-white pt-4 mt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className={cn('text-gray-600', isOverAllocated && 'text-red-600')}>
              Awarded: {formatRSC({ amount: totalAwarded })} RSC ({percentageAwarded.toFixed(1)}%)
            </span>
            <span className={cn('text-gray-600', isOverAllocated && 'text-red-600')}>
              Remaining: {formatRSC({ amount: remainingAmount })} RSC
            </span>
          </div>
          <Progress
            value={totalAwarded}
            max={totalBountyAmount}
            className={cn('mb-3', isOverAllocated && '[&>div]:bg-red-500 bg-red-100')}
            variant={isExactlyHundredPercent ? 'success' : 'default'}
          />
          {isOverAllocated && (
            <Alert variant="error">
              Total awarded amount exceeds the bounty amount. Please adjust your allocations.
            </Alert>
          )}
          <Button
            onClick={handleSubmitAwards}
            disabled={!isExactlyHundredPercent || isSubmitting || isOverAllocated}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : isOverAllocated ? 'Over Allocated' : 'Submit Awards'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
