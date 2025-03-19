import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useMemo, useEffect, useCallback, FC } from 'react';
import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
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
import { CommentItem } from './CommentItem';
import { Trophy, DollarSign, Award, PercentIcon, Zap } from 'lucide-react';

interface AwardBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment;
  contentType: ContentType;
  onBountyUpdated?: () => void;
}

// Explanation banner component
const ExplanationBanner: FC = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div className="flex items-start">
      <div className="mr-3 mt-0.5">
        <Trophy className="h-5 w-5 text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-blue-800">Award your bounty</h3>
        <p className="text-sm text-blue-600 mt-1">
          Select which comments you'd like to award your bounty to. You can distribute the bounty
          amount among multiple comments or award it all to a single comment. You must allocate 100%
          of the bounty to proceed.
        </p>
      </div>
    </div>
  </div>
);

// Component for percentage selection buttons
const PercentageSelector: FC<{
  commentId: number;
  selectedPercentage: number;
  onPercentageClick: (commentId: number, percentage: number) => void;
}> = ({ commentId, selectedPercentage, onPercentageClick }) => {
  const percentageOptions = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-wrap gap-2">
      {percentageOptions.map((percentage) => (
        <button
          key={`${commentId}-${percentage}`}
          type="button"
          onClick={() => onPercentageClick(commentId, percentage)}
          className={cn(
            'px-2 py-1 text-xs rounded-md transition-colors',
            selectedPercentage === percentage
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          )}
        >
          {percentage}%
        </button>
      ))}
    </div>
  );
};

// Component for amount input
const AmountInput: FC<{
  commentId: number;
  awardAmount: number;
  totalBountyAmount: number;
  percentageOfTotal: number;
  onAwardChange: (commentId: number, amount: number) => void;
}> = ({ commentId, awardAmount, totalBountyAmount, percentageOfTotal, onAwardChange }) => {
  // Local state to handle input value
  const [inputValue, setInputValue] = useState<string>(awardAmount ? awardAmount.toString() : '');

  // Update local state when awardAmount changes from parent
  useEffect(() => {
    if (awardAmount === 0) {
      setInputValue('0');
    } else if (awardAmount > 0) {
      setInputValue(awardAmount.toString());
    }
  }, [awardAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      onAwardChange(commentId, numericValue);
    } else if (newValue === '' || newValue === '0') {
      onAwardChange(commentId, 0);
    }
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <div className="relative">
        <Input
          type="number"
          min={0}
          max={totalBountyAmount}
          step={0.1}
          value={inputValue}
          onChange={handleInputChange}
          className="w-24 pr-12 text-right"
          placeholder="0.0"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 sm:text-sm">RSC</span>
        </div>
      </div>
      <div className="text-xs text-gray-500">({percentageOfTotal.toFixed(1)}%)</div>
    </div>
  );
};

// Comment card with award controls
const AwardableCommentCard: FC<{
  comment: Comment;
  contentType: ContentType;
  commentId: number;
  awardAmount: number;
  selectedPercentage: number;
  totalBountyAmount: number;
  onPercentageClick: (commentId: number, percentage: number) => void;
  onAwardChange: (commentId: number, amount: number) => void;
}> = ({
  comment,
  contentType,
  commentId,
  awardAmount,
  selectedPercentage,
  totalBountyAmount,
  onPercentageClick,
  onAwardChange,
}) => {
  const percentageOfTotal = (awardAmount / totalBountyAmount) * 100;

  // Memoize CommentItem to prevent unnecessary re-renders
  const MemoizedCommentItem = useMemo(
    () => <CommentItem comment={comment} contentType={contentType} showTooltips={false} />,
    [comment, contentType]
  );

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-grow mb-4">{MemoizedCommentItem}</div>

      {/* Award allocation UI */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium text-gray-700 mr-2">Award:</div>

          {/* Percentage buttons */}
          <PercentageSelector
            commentId={commentId}
            selectedPercentage={selectedPercentage}
            onPercentageClick={onPercentageClick}
          />

          {/* Custom amount input */}
          <AmountInput
            commentId={commentId}
            awardAmount={awardAmount}
            totalBountyAmount={totalBountyAmount}
            percentageOfTotal={percentageOfTotal}
            onAwardChange={onAwardChange}
          />
        </div>
      </div>
    </div>
  );
};

// Award summary component
const AwardSummary: FC<{
  totalAwarded: number;
  remainingAmount: number;
  percentageAwarded: number;
  isExactlyHundredPercent: boolean;
  isOverAllocated: boolean;
  isSubmitting: boolean;
  isCommentsLoading: boolean;
  handleSubmitAwards: () => void;
}> = ({
  totalAwarded,
  remainingAmount,
  percentageAwarded,
  isExactlyHundredPercent,
  isOverAllocated,
  isSubmitting,
  isCommentsLoading,
  handleSubmitAwards,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between text-sm">
      <span className={cn('font-medium text-gray-700', isOverAllocated && 'text-red-600')}>
        Awarded: {formatRSC({ amount: totalAwarded })} RSC ({percentageAwarded.toFixed(1)}%)
      </span>
      <span className={cn('text-gray-600', isOverAllocated && 'text-red-600')}>
        Remaining: {formatRSC({ amount: remainingAmount })} RSC
      </span>
    </div>

    <Progress
      value={percentageAwarded}
      max={100}
      className={cn(
        'mb-3',
        isOverAllocated && '[&>div]:bg-red-500 bg-red-100',
        isExactlyHundredPercent && '[&>div]:bg-green-500'
      )}
    />

    {isOverAllocated && (
      <Alert variant="error">
        Total awarded amount exceeds the bounty amount. Please adjust your allocations.
      </Alert>
    )}

    {!isOverAllocated && !isExactlyHundredPercent && totalAwarded > 0 && (
      <Alert variant="warning">
        You must allocate exactly 100% of the bounty amount to proceed.
      </Alert>
    )}

    <Button
      onClick={handleSubmitAwards}
      disabled={!isExactlyHundredPercent || isSubmitting || isOverAllocated || isCommentsLoading}
      className="w-full"
    >
      {isSubmitting
        ? 'Submitting...'
        : isCommentsLoading
          ? 'Loading Comments...'
          : isOverAllocated
            ? 'Reduce Allocations'
            : isExactlyHundredPercent
              ? 'Submit Awards'
              : `Allocate Remaining ${(100 - percentageAwarded).toFixed(1)}%`}
    </Button>
  </div>
);

// Quick allocation actions
const QuickAllocationActions: FC<{
  eligibleCommentIds: number[];
  onClearAll: () => void;
  onDistributeEqually: (commentIds: number[]) => void;
}> = ({ eligibleCommentIds, onClearAll, onDistributeEqually }) => (
  <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="outlined" onClick={onClearAll} className="text-xs">
      Clear All
    </Button>
    <Button
      size="sm"
      variant="secondary"
      onClick={() => onDistributeEqually(eligibleCommentIds)}
      className="text-xs"
    >
      Distribute Equally
    </Button>
  </div>
);

// Custom component to filter out comments with bounties and display award controls
const FilteredCommentFeed = ({
  documentId,
  contentType,
  totalBountyAmount,
  awardAmounts,
  selectedPercentages,
  onAwardChange,
  onPercentageClick,
  onSetEligibleComments,
  onLoadingChange,
}: {
  documentId: number;
  contentType: ContentType;
  totalBountyAmount: number;
  awardAmounts: Record<number, number>;
  selectedPercentages: Record<number, number>;
  onAwardChange: (commentId: number, amount: number) => void;
  onPercentageClick: (commentId: number, percentage: number) => void;
  onSetEligibleComments: (commentIds: number[]) => void;
  onLoadingChange: (loading: boolean) => void;
}) => {
  // Use state to store all comments
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize callbacks to prevent them from changing on every render
  const stableOnLoadingChange = useCallback(
    (loading: boolean) => {
      onLoadingChange(loading);
    },
    [onLoadingChange]
  );

  const stableOnSetEligibleComments = useCallback(
    (commentIds: number[]) => {
      onSetEligibleComments(commentIds);
    },
    [onSetEligibleComments]
  );

  // Fetch all comments when the component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchAllComments = async () => {
      if (isMounted) {
        setIsLoading(true);
        stableOnLoadingChange(true);
      }

      try {
        const CommentService = (await import('@/services/comment.service')).CommentService;
        const response = await CommentService.fetchComments({
          documentId,
          contentType,
          sort: 'TOP',
          pageSize: 100,
        });

        if (isMounted) {
          if (response && response.comments) {
            setAllComments(response.comments);
          } else {
            setAllComments([]);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch comments:', err);
          setError('Failed to load comments. Please try again.');
          setAllComments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          stableOnLoadingChange(false);
        }
      }
    };

    fetchAllComments();

    return () => {
      isMounted = false;
    };
  }, [documentId, contentType, stableOnLoadingChange]);

  // Filter out comments that have bounties
  const commentsWithoutBounties = useMemo(() => {
    return allComments.filter((comment) => {
      const isBountyComment = comment.commentType === 'BOUNTY' || hasBounties(comment);
      const isTopLevelComment = !comment.parentId;
      return !isBountyComment && isTopLevelComment;
    });
  }, [allComments]);

  // Notify parent component about eligible comments when they change
  useEffect(() => {
    if (!isLoading) {
      if (commentsWithoutBounties.length > 0) {
        const eligibleIds = commentsWithoutBounties.map((comment) => comment.id);
        stableOnSetEligibleComments(eligibleIds);
      } else {
        stableOnSetEligibleComments([]);
      }
    }
  }, [commentsWithoutBounties, isLoading, stableOnSetEligibleComments]);

  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">Loading comments...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  if (commentsWithoutBounties.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">
          No comments available to award. Any user can comment to be eligible for this bounty.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {commentsWithoutBounties.map((comment) => {
        const commentId = comment.id;
        const awardAmount = awardAmounts[commentId] || 0;
        const selectedPercentage = selectedPercentages[commentId] || 0;

        return (
          <AwardableCommentCard
            key={commentId}
            comment={comment}
            contentType={contentType}
            commentId={commentId}
            awardAmount={awardAmount}
            selectedPercentage={selectedPercentage}
            totalBountyAmount={totalBountyAmount}
            onPercentageClick={onPercentageClick}
            onAwardChange={onAwardChange}
          />
        );
      })}
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
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const { forceRefresh } = useComments();
  const [eligibleCommentIds, setEligibleCommentIds] = useState<number[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAwardAmounts({});
      setSelectedPercentages({});
      setEligibleCommentIds([]);
      setIsCommentsLoading(true);
    }
  }, [isOpen]);

  // Get the total bounty amount available to award
  const activeBounty = comment.bounties?.find(isOpenBounty);
  const totalBountyAmount = activeBounty ? parseFloat(activeBounty.totalAmount) : 0;

  // Calculate total amount awarded and remaining
  const totalAwarded = useMemo(() => {
    return Object.values(awardAmounts).reduce((sum, amount) => sum + (amount || 0), 0);
  }, [awardAmounts]);

  const remainingAmount = totalBountyAmount - totalAwarded;
  const percentageAwarded = (totalAwarded / totalBountyAmount) * 100;
  const isExactlyHundredPercent = Math.abs(percentageAwarded - 100) < 0.01;
  const isOverAllocated = percentageAwarded > 100;

  // Handler functions with useCallback
  const handleCustomAmount = useCallback((commentId: number, value: number) => {
    setAwardAmounts((prev) => ({
      ...prev,
      [commentId]: value,
    }));
    setSelectedPercentages((prev) => ({
      ...prev,
      [commentId]: 0,
    }));
  }, []);

  const handlePercentageClick = useCallback(
    (commentId: number, percentage: number) => {
      const amount = (totalBountyAmount * percentage) / 100;
      setAwardAmounts((prev) => ({
        ...prev,
        [commentId]: amount,
      }));
      setSelectedPercentages((prev) => ({
        ...prev,
        [commentId]: percentage,
      }));
    },
    [totalBountyAmount]
  );

  const handleClearAll = useCallback(() => {
    setAwardAmounts({});
    setSelectedPercentages({});
  }, []);

  const handleDistributeEqually = useCallback(
    (commentIds: number[]) => {
      if (commentIds.length === 0) return;

      const equalPercentage = 100 / commentIds.length;
      const equalAmount = totalBountyAmount / commentIds.length;

      const newAwardAmounts: Record<number, number> = {};
      const newSelectedPercentages: Record<number, number> = {};

      commentIds.forEach((id) => {
        newAwardAmounts[id] = equalAmount;
        newSelectedPercentages[id] = equalPercentage;
      });

      setAwardAmounts(newAwardAmounts);
      setSelectedPercentages(newSelectedPercentages);
    },
    [totalBountyAmount]
  );

  const handleSetEligibleComments = useCallback((commentIds: number[]) => {
    setEligibleCommentIds(commentIds);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsCommentsLoading(loading);
  }, []);

  const handleSubmitAwards = async () => {
    if (!isExactlyHundredPercent) return;

    setIsSubmitting(true);
    try {
      if (!activeBounty) {
        throw new Error('No active bounty found');
      }

      const awards = Object.entries(awardAmounts)
        .filter(([_, amount]) => amount > 0)
        .map(([commentId, amount]) => ({
          commentId: parseInt(commentId),
          amount,
        }));

      if (awards.length === 0) {
        throw new Error(
          'No valid awards found. Please allocate the bounty to at least one comment.'
        );
      }

      await BountyService.awardBounty(activeBounty.id, awards);
      toast.success('Bounty awards submitted successfully');

      try {
        await forceRefresh?.();
        if (onBountyUpdated) {
          onBountyUpdated();
        }
      } catch (refreshError) {
        console.error('Failed to refresh comments:', refreshError);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Award Bounty">
      <div>
        {/* Explanation banner instead of the bounty display */}
        <ExplanationBanner />

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600 font-medium">
            Total bounty amount: {formatRSC({ amount: totalBountyAmount })} RSC
          </div>

          {/* Quick allocation actions */}
          {!isCommentsLoading && eligibleCommentIds.length > 0 && (
            <QuickAllocationActions
              eligibleCommentIds={eligibleCommentIds}
              onClearAll={handleClearAll}
              onDistributeEqually={handleDistributeEqually}
            />
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 -mx-6">
        <div className="max-h-[400px] overflow-y-auto px-6">
          <FilteredCommentFeed
            documentId={comment.thread.objectId}
            contentType={contentType}
            totalBountyAmount={totalBountyAmount}
            awardAmounts={awardAmounts}
            selectedPercentages={selectedPercentages}
            onAwardChange={handleCustomAmount}
            onPercentageClick={handlePercentageClick}
            onSetEligibleComments={handleSetEligibleComments}
            onLoadingChange={handleLoadingChange}
          />
        </div>
      </div>

      {/* Award summary bar */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white pt-4 -mx-6 px-6 pb-0">
        <AwardSummary
          totalAwarded={totalAwarded}
          remainingAmount={remainingAmount}
          percentageAwarded={percentageAwarded}
          isExactlyHundredPercent={isExactlyHundredPercent}
          isOverAllocated={isOverAllocated}
          isSubmitting={isSubmitting}
          isCommentsLoading={isCommentsLoading}
          handleSubmitAwards={handleSubmitAwards}
        />
      </div>
    </Modal>
  );
};
