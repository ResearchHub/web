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
  <div className="flex items-center mb-6">
    <span className="text-md text-gray-700">
      Distribute your bounty to all comments you'd like to award.
    </span>
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
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      {percentageOptions.map((percentage) => (
        <button
          key={`${commentId}-${percentage}`}
          type="button"
          onClick={() => onPercentageClick(commentId, percentage)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors flex-1 sm:flex-none',
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
    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <div className="relative w-full sm:w-auto">
        <Input
          type="number"
          min={0}
          max={totalBountyAmount}
          step={0.1}
          value={inputValue}
          onChange={handleInputChange}
          className="w-full sm:w-40 pr-12 text-right"
          placeholder="0.0"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 sm:text-sm">RSC</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">
        ({percentageOfTotal.toFixed(1)}%)
      </div>
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
  const isReply = !!comment.parentId;

  // Memoize CommentItem to prevent unnecessary re-renders
  const MemoizedCommentItem = useMemo(
    () => (
      <CommentItem
        comment={comment}
        contentType={contentType}
        showTooltips={false}
        includeReplies={false}
      />
    ),
    [comment, contentType]
  );

  return (
    <div
      className={cn(
        'p-4 hover:bg-gray-50 transition-colors',
        isReply && 'pl-8 border-l-2 border-l-gray-100'
      )}
    >
      {isReply && (
        <div className="text-xs text-gray-500 mb-2">Reply to comment #{comment.parentId}</div>
      )}
      <div className="flex-grow mb-4">{MemoizedCommentItem}</div>

      {/* Award allocation UI */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-sm font-medium text-gray-700">Award:</div>

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
  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
    <Button size="sm" variant="outlined" onClick={onClearAll} className="text-xs w-full sm:w-auto">
      Clear All
    </Button>
    <Button
      size="sm"
      variant="secondary"
      onClick={() => onDistributeEqually(eligibleCommentIds)}
      className="text-xs w-full sm:w-auto"
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

        // Fetch both BOUNTY and REVIEW comments to get all eligible candidates, then combine them.
        // we're using Promise.all to fetch both types parallelly.
        const [bountyResponse, reviewResponse] = await Promise.all([
          CommentService.fetchComments({
            documentId,
            contentType,
            sort: 'TOP',
            pageSize: 100,
            filter: 'BOUNTY',
          }),
          CommentService.fetchComments({
            documentId,
            contentType,
            sort: 'TOP',
            pageSize: 100,
            filter: 'REVIEW',
          }),
        ]);

        if (isMounted) {
          const bountyComments = bountyResponse?.comments || [];
          const reviewComments = reviewResponse?.comments || [];

          // Deduplicate comments by ID to avoid duplicate candidates
          // Added this as a defensive approach,
          // for instance comments from the bounties tab may reappear on the reviews tab
          // and vice versa.

          const combinedComments = [...bountyComments, ...reviewComments];
          const uniqueComments = combinedComments.filter(
            (comment, index, array) => array.findIndex((c) => c.id === comment.id) === index
          );

          setAllComments(uniqueComments);
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

  // Filter comments to find eligible candidates for bounty awards
  // This was previously called commentsWithoutBounties
  const eligibleComments = useMemo(() => {
    // Helper function to flatten a comment tree
    const flattenComments = (comments: Comment[]): Comment[] => {
      return comments.reduce<Comment[]>((acc, comment) => {
        // ELIGIBILITY LOGIC: Check if comment is eligible for award
        // is EligibleForAward was previously isBountyComment, renamed for clarity and consistency of terms used here
        const isEligibleForAward = (comment: Comment): boolean => {
          // DECISION NEEDED, REVIEW COMMENT AWARD OPTIONS:
          // OPTION 1: Allow Double-Award of REVIEW comments even if they already have received past bounties award OR direct tips
          // if (comment.commentType === 'REVIEW') {
          //   return true;
          // }

          // OPTION 2: Exclude REVIEW comments that already have any awards. We ONLY allow REVIEW comments without existing bounties OR tips
          // if (comment.commentType === 'REVIEW') {
          //   const hasAwardItems = hasBounties(comment) || (comment?.tips?.length || 0) > 0 || (comment?.awardedBountyAmount || 0) > 0;
          //   return !hasAwardItems;
          // }

          // OPTION 3 BEST?: Exclude REVIEW comments that have previous bounty awards (awardedBountyAmount),
          // but INCLUDE those that only received direct tips from elsewhere
          // Note: awarded bounties appear as tips in the UI. (see components/Feed/FeedItemActions.tsx)
          // so direct tips are tips that are not originated from awarded bounties
          if (comment.commentType === 'REVIEW') {
            const hasDirectTipsOnly =
              (comment?.tips?.length || 0) > 0 && !(comment?.awardedBountyAmount || 0);
            const hasNoPreviousAwards =
              !hasBounties(comment) && !(comment?.awardedBountyAmount || 0);
            return hasDirectTipsOnly || hasNoPreviousAwards;
          }

          return false;
        };

        // Add eligible comments to the result
        if (isEligibleForAward(comment)) {
          acc.push(comment);
        }

        // Recursively process replies if they exist
        if (comment.replies && comment.replies.length > 0) {
          acc.push(...flattenComments(comment.replies));
        }

        return acc;
      }, []);
    };

    // Start with top-level comments and flatten
    return flattenComments(allComments);
  }, [allComments]);

  // Notify parent component about eligible comments when they change
  useEffect(() => {
    if (!isLoading) {
      if (eligibleComments.length > 0) {
        const eligibleIds = eligibleComments.map((comment) => comment.id);
        stableOnSetEligibleComments(eligibleIds);
      } else {
        stableOnSetEligibleComments([]);
      }
    }
  }, [eligibleComments, isLoading, stableOnSetEligibleComments]);

  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">Loading comments...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  if (eligibleComments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">
          No comments available to award. Any user can comment or reply to be eligible for this
          bounty.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {eligibleComments.map((comment) => {
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

      // DEBUG: Log what we're trying to award
      console.log('Attempting to award bounty:', {
        bountyId: activeBounty.id,
        awards,
        totalAmount: awards.reduce((sum, award) => sum + award.amount, 0),
      });

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
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
