import { useState, useMemo } from 'react';
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

interface AwardBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment;
  contentType: ContentType;
}

export const AwardBountyModal = ({
  isOpen,
  onClose,
  comment,
  contentType,
}: AwardBountyModalProps) => {
  const [awardAmounts, setAwardAmounts] = useState<Record<number, number>>({});
  const [selectedPercentages, setSelectedPercentages] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the total bounty amount available to award
  const activeBounty = comment.bounties.find(
    (bounty) => bounty.status === 'OPEN' && !bounty.isContribution
  );
  const totalBountyAmount = activeBounty ? Number(activeBounty.amount) : 0;

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
      // TODO: Implement the API call to submit all awards at once
      console.log('Submitting awards:', awardAmounts);
      onClose();
    } catch (error) {
      console.error('Failed to submit awards:', error);
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

  const renderBountyAwardActions = (comment: Comment) => {
    const percentages = [25, 50, 75, 100];
    const selectedPercentage = selectedPercentages[comment.id] || 0;

    return (
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 font-medium">Award</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={remainingAmount + (awardAmounts[comment.id] || 0)}
              placeholder="Amount"
              value={awardAmounts[comment.id] || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                handleCustomAmount(comment.id, isNaN(value) ? 0 : value);
              }}
              className="w-40"
              rightElement={
                <div className="flex items-center h-full">
                  <span className="text-sm text-gray-500 pr-2">RSC</span>
                </div>
              }
            />
            {percentages.map((percentage) => (
              <Button
                key={percentage}
                variant="outlined"
                size="sm"
                onClick={() => handlePercentageClick(comment.id, percentage)}
                className={cn(
                  'px-2 py-1 text-xs',
                  selectedPercentage === percentage && 'bg-gray-100'
                )}
              >
                {percentage}%
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Award Bounty">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">How to Award the Bounty</h4>
            <p className="text-sm text-gray-600">
              Specify the amount you want to award to each contribution. You must allocate exactly
              100% of the bounty amount ({formatRSC({ amount: totalBountyAmount })} RSC) before
              submitting.
            </p>
          </div>

          {/* Comments with award inputs */}
          <CommentFeed
            documentId={comment.thread.objectId}
            contentType={contentType}
            commentType="GENERIC_COMMENT"
            renderBountyAwardActions={renderBountyAwardActions}
            renderCommentActions={false}
          />
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
              {isSubmitting
                ? 'Submitting...'
                : isOverAllocated
                  ? 'Over Allocated'
                  : 'Submit Awards'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
