import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { BaseModal } from '@/components/ui/BaseModal';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/utils/styles';
import { BountyService } from '@/services/bounty.service';
import { toast } from 'react-hot-toast';
import { isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { Trophy, Award } from 'lucide-react';
import { Bounty } from '@/types/bounty';

interface AwardBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment;
  bounty: Bounty;
  onBountyUpdated?: () => void;
}

export const AwardBountyModal = ({
  isOpen,
  onClose,
  comment,
  bounty,
  onBountyUpdated,
}: AwardBountyModalProps) => {
  const [awardAmount, setAwardAmount] = useState<string>('');
  const [selectedPercentage, setSelectedPercentage] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the total bounty amount available to award
  const totalBountyAmount = bounty ? parseFloat(bounty.totalAmount) : 0;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAwardAmount('');
      setSelectedPercentage(0);
    }
  }, [isOpen]);

  // Calculate percentage based on amount
  const calculatePercentage = useCallback(
    (amount: number) => {
      if (totalBountyAmount === 0) return 0;
      return (amount / totalBountyAmount) * 100;
    },
    [totalBountyAmount]
  );

  // Handle custom amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAwardAmount(value);

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setSelectedPercentage(0); // Clear percentage selection
    }
  };

  // Handle percentage button click
  const handlePercentageClick = (percentage: number) => {
    setSelectedPercentage(percentage);
    const amount = (totalBountyAmount * percentage) / 100;
    setAwardAmount(amount.toFixed(2));
  };

  // Get numeric amount
  const numericAmount = parseFloat(awardAmount) || 0;
  const percentageOfTotal = calculatePercentage(numericAmount);

  // Validation
  const isValidAmount = numericAmount > 0 && numericAmount <= totalBountyAmount;
  const isOverAllocated = numericAmount > totalBountyAmount;

  // Handle award submission
  const handleSubmitAward = async () => {
    if (!isValidAmount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const awards = [
        {
          commentId: comment.id,
          amount: numericAmount,
        },
      ];

      await BountyService.awardBounty(bounty.id, awards);
      toast.success(`Successfully awarded ${formatRSC({ amount: numericAmount })} RSC`);

      if (onBountyUpdated) {
        onBountyUpdated();
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit award:', error);
      toast.error('Failed to award bounty. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const authorName = comment.createdBy?.authorProfile?.fullName || 'this user';

  const modalFooter = (
    <div className="flex gap-3">
      <Button variant="outlined" onClick={onClose} disabled={isSubmitting} className="flex-1">
        Cancel
      </Button>
      <Button
        onClick={handleSubmitAward}
        disabled={!isValidAmount || isSubmitting}
        className="flex-1 gap-2"
      >
        {isSubmitting ? (
          'Awarding...'
        ) : (
          <>
            <Award size={16} />
            Award {numericAmount > 0 && formatRSC({ amount: numericAmount })} RSC
          </>
        )}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Award Bounty"
      maxWidth="max-w-md"
      showCloseButton={true}
      footer={modalFooter}
    >
      <div className="space-y-6">
        {/* Header with bounty info */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} className="text-orange-600" />
            <h3 className="font-medium text-orange-900">Award from Bounty Pool</h3>
          </div>
          <p className="text-sm text-orange-700">
            Total available:{' '}
            <span className="font-semibold">{formatRSC({ amount: totalBountyAmount })} RSC</span>
          </p>
        </div>

        {/* Recipient info */}
        <div className="text-sm text-gray-600">
          Awarding to: <span className="font-medium text-gray-900">{authorName}</span>
        </div>

        {/* Percentage buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick allocation</label>
          <div className="grid grid-cols-5 gap-2">
            {[10, 25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handlePercentageClick(percentage)}
                className={cn(
                  'py-2 px-3 text-sm rounded-md transition-colors',
                  selectedPercentage === percentage
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                )}
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Award amount</label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              max={totalBountyAmount}
              step={0.01}
              value={awardAmount}
              onChange={handleAmountChange}
              className="pr-20"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500">RSC</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {percentageOfTotal > 0 && <span>{percentageOfTotal.toFixed(1)}% of total bounty</span>}
          </p>
        </div>

        {/* Validation messages */}
        {isOverAllocated && (
          <Alert variant="error">
            Amount exceeds available bounty pool. Maximum:{' '}
            {formatRSC({ amount: totalBountyAmount })} RSC
          </Alert>
        )}

        {numericAmount > 0 && numericAmount < 0.01 && (
          <Alert variant="warning">Minimum award amount is 0.01 RSC</Alert>
        )}
      </div>
    </BaseModal>
  );
};
