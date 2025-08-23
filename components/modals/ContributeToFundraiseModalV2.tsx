'use client';

import { FC, useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { useUser } from '@/contexts/UserContext';
import { useCreateContribution } from '@/hooks/useFundraise';
import { X, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContributeToFundraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess?: () => void;
  fundraise: any; // Using any for now as per your request
}

export const ContributeToFundraiseModalV2: FC<ContributeToFundraiseModalProps> = ({
  isOpen,
  onClose,
  onContributeSuccess,
  fundraise,
}) => {
  const { user } = useUser();
  const [inputAmount, setInputAmount] = useState(1000);
  const [isContributing, setIsContributing] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);

  const [{ isLoading, error }, createContribution] = useCreateContribution();

  // Calculate user balance and fundraise progress
  const userBalance = user?.balance || 0;
  const lockedBalance = user?.lockedBalance || 0;
  const totalAvailableBalance = userBalance + lockedBalance;

  const goalAmount = fundraise?.goalAmount?.rsc || 500000;
  const amountRaised = fundraise?.amountRaised?.rsc || 50000;
  const progressPercentage = Math.min((amountRaised / goalAmount) * 100, 100);

  // Calculate user's impact based on the contribution amount
  const calculateUserImpact = (amount: number) => {
    if (amount === 0 || goalAmount === 0) return '0.0%';
    const impactPercentage = (amount / goalAmount) * 100;
    return `+${impactPercentage.toFixed(1)}%`;
  };

  const userImpact = calculateUserImpact(inputAmount);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue);

    if (!isNaN(numValue)) {
      setInputAmount(numValue);

      // Validate minimum amount
      if (numValue < 10) {
        setAmountError('Minimum contribution amount is 10 RSC');
      } else if (numValue > totalAvailableBalance) {
        setAmountError('Amount exceeds your available balance');
      } else {
        setAmountError(undefined);
      }
    } else {
      setInputAmount(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const handleContribute = async () => {
    if (amountError || inputAmount < 10) {
      return;
    }

    try {
      setIsContributing(true);
      await createContribution(fundraise.id, { amount: inputAmount });

      toast.success('Contribution successful!');

      if (onContributeSuccess) {
        onContributeSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Contribution failed:', error);
      toast.error('Failed to contribute. Please try again.');
    } finally {
      setIsContributing(false);
    }
  };

  const insufficientBalance = inputAmount > totalAvailableBalance;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth="max-w-lg"
      padding="p-0"
    >
      {/* Header with close button */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-1">
            Fund Proposal
            <span className="ml-2 inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              RSC
            </span>
          </h2>
          <p className="text-white/80 text-sm">Support cutting-edge research.</p>
        </div>
      </div>

      {/* Your Balance Section */}
      <div className="px-6 -mt-3">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 text-white text-center shadow-lg">
          <p className="text-sm text-white/80 mb-1">Your Balance</p>
          <p className="text-3xl font-bold">{totalAvailableBalance.toLocaleString()}</p>
          <p className="text-sm text-white/80">RSC</p>
        </div>
      </div>

      {/* Proposal Details Section */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
            Center for Cybernomics and Continuation of Moore's Law: Research on Next-Generation
            Computing Architectures.
          </h3>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Funding Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Preview of new progress after contribution */}
              {inputAmount > 0 && (
                <div
                  className="absolute top-0 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300 opacity-60"
                  style={{
                    left: `${progressPercentage}%`,
                    width: `${(inputAmount / goalAmount) * 100}%`,
                  }}
                />
              )}
            </div>
            {inputAmount > 0 && (
              <p className="text-xs text-green-600 mt-1">
                +{((inputAmount / goalAmount) * 100).toFixed(1)}% with your contribution
              </p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{amountRaised.toLocaleString()}</p>
              <p className="text-sm text-gray-600">RSC Raised</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{goalAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">RSC Goal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{userImpact}</p>
              <p className="text-sm text-gray-600">Your Impact</p>
            </div>
          </div>

          {/* Amount to Fund Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Fund</label>
            <div className="relative">
              <Input
                type="text"
                value={inputAmount.toLocaleString()}
                onChange={handleAmountChange}
                error={amountError}
                className="pr-16 text-lg font-semibold"
                rightElement={
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    RSC
                  </div>
                }
              />
            </div>

            {/* Footer Text */}
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-500">Funding amount</span>
              <span className="font-medium text-gray-900">{inputAmount.toLocaleString()} RSC</span>
            </div>
          </div>

          {/* Impact Calculator Section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Contribution Impact Calculator
            </h4>

            <div className="space-y-3">
              {/* New Progress After Contribution */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Progress:</span>
                <span className="text-sm font-medium text-gray-900">
                  {(((amountRaised + inputAmount) / goalAmount) * 100).toFixed(1)}%
                </span>
              </div>

              {/* New Amount Raised */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Total Raised:</span>
                <span className="text-sm font-medium text-gray-900">
                  {(amountRaised + inputAmount).toLocaleString()} RSC
                </span>
              </div>

              {/* Your Impact */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Impact:</span>
                <span className="text-sm font-semibold text-green-600">{userImpact}</span>
              </div>

              {/* Remaining to Goal */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining to Goal:</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.max(0, goalAmount - amountRaised - inputAmount).toLocaleString()} RSC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <Button
          onClick={handleContribute}
          disabled={isContributing || isLoading || !!amountError || insufficientBalance}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg"
        >
          {isContributing || isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              Fund This Research
            </div>
          )}
        </Button>

        {insufficientBalance && (
          <p className="text-sm text-red-600 text-center mt-2">
            Insufficient balance. You need {(inputAmount - totalAvailableBalance).toLocaleString()}{' '}
            more RSC.
          </p>
        )}
      </div>
    </BaseModal>
  );
};
