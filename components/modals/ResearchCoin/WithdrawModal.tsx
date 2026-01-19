'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Check, AlertCircle, ExternalLink, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';
import { BaseModal } from '@/components/ui/BaseModal';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount } from 'wagmi';
import { useWithdrawRSC } from '@/hooks/useWithdrawRSC';
import { cn } from '@/utils/styles';
import { NetworkSelector } from '@/components/ui/NetworkSelector';
import { NETWORK_CONFIG, NetworkType } from '@/constants/tokens';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { WithdrawalSuccessView } from './WithdrawalSuccessView';

// Minimum withdrawal amount in RSC
const MIN_WITHDRAWAL_AMOUNT = 150;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('BASE');
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const [{ txStatus, isLoading, fee, isFeeLoading, feeError }, withdrawRSC, resetTransaction] =
    useWithdrawRSC({
      network: selectedNetwork,
    });

  const networkConfig = NETWORK_CONFIG[selectedNetwork];
  const blockExplorerUrl = networkConfig.explorerUrl;

  useEffect(() => {
    if (!isOpen) {
      // Delay reset to ensure modal closing animation completes
      const timeoutId = setTimeout(() => {
        setAmount('');
        setSelectedNetwork('BASE');
        setIsCopied(false);
        resetTransaction();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, resetTransaction]);

  useEffect(() => {
    if (txStatus.state === 'error') {
      if (contentRef.current) {
        const scrollableParent = contentRef.current.closest('[class*="overflow-y-auto"]');
        if (scrollableParent) {
          scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [txStatus]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const withdrawAmount = useMemo(() => parseInt(amount || '0', 10), [amount]);

  const amountUserWillReceive = useMemo((): number => {
    if (!fee) return 0;
    return Math.max(0, withdrawAmount - fee);
  }, [withdrawAmount, fee]);

  const isBelowMinimum = useMemo(
    () => withdrawAmount > 0 && withdrawAmount < MIN_WITHDRAWAL_AMOUNT,
    [withdrawAmount]
  );

  // Calculate total amount needed (withdrawal amount)
  const calculateTotalWithFee = useCallback((): number => {
    return withdrawAmount;
  }, [withdrawAmount]);

  const calculateNewBalance = useCallback((): number => {
    return Math.max(0, availableBalance - calculateTotalWithFee());
  }, [availableBalance, calculateTotalWithFee]);

  // Check if user has enough balance for withdrawal
  const hasInsufficientBalance = useMemo(
    () => withdrawAmount > 0 && withdrawAmount > availableBalance,
    [withdrawAmount, availableBalance]
  );

  // Determine if withdraw button should be disabled
  const isButtonDisabled = useMemo(
    () =>
      !amount ||
      withdrawAmount <= 0 ||
      txStatus.state === 'pending' ||
      isFeeLoading ||
      !fee ||
      hasInsufficientBalance ||
      isBelowMinimum ||
      amountUserWillReceive <= 0,
    [
      amount,
      withdrawAmount,
      txStatus.state,
      isFeeLoading,
      fee,
      hasInsufficientBalance,
      isBelowMinimum,
      amountUserWillReceive,
    ]
  );

  const isInputDisabled = useCallback(() => {
    return !address || txStatus.state === 'pending' || txStatus.state === 'success';
  }, [address, txStatus.state]);

  const handleMaxAmount = useCallback(() => {
    if (isInputDisabled() || !fee) return;
    const maxWithdrawAmount = Math.floor(availableBalance);
    setAmount(maxWithdrawAmount > 0 ? maxWithdrawAmount.toString() : '0');
  }, [availableBalance, isInputDisabled, fee]);

  const handleWithdraw = useCallback(async () => {
    if (!address || !amount || isButtonDisabled || !fee) {
      return;
    }

    const result = await withdrawRSC({
      to_address: address,
      agreed_to_terms: true,
      amount: amount,
      network: selectedNetwork,
    });

    if (result && txStatus.state === 'success' && onSuccess) {
      onSuccess();
    }
  }, [
    address,
    amount,
    isButtonDisabled,
    withdrawRSC,
    txStatus.state,
    onSuccess,
    fee,
    selectedNetwork,
  ]);

  const handleCopyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(
      () => {
        setIsCopied(true);
        toast.success('Address copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy address: ', err);
        toast.error('Failed to copy address.');
      }
    );
  }, [address]);

  if (!address) {
    return null;
  }

  const footer = useMemo(() => {
    if (txStatus.state === 'success') {
      const txHash = 'txHash' in txStatus ? txStatus.txHash : undefined;
      if (txHash) {
        const normalizedTxHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
        return (
          <a
            href={`${blockExplorerUrl}/tx/${normalizedTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full" size="lg">
              View Transaction
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>
        );
      }
    }

    return (
      <Button onClick={handleWithdraw} disabled={isButtonDisabled} className="w-full" size="lg">
        {isFeeLoading || txStatus.state === 'pending' ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isFeeLoading ? 'Loading fee...' : 'Processing...'}
          </>
        ) : (
          'Withdraw RSC'
        )}
      </Button>
    );
  }, [txStatus, blockExplorerUrl, isButtonDisabled, handleWithdraw, isFeeLoading]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw RSC"
      padding="p-8"
      footer={footer}
      className="md:!w-[500px]"
    >
      <div ref={contentRef} className="space-y-6">
        {txStatus.state === 'success' ? (
          <WithdrawalSuccessView
            withdrawAmount={withdrawAmount}
            fee={fee || 0}
            amountReceived={amountUserWillReceive}
            networkConfig={networkConfig}
            address={address || ''}
          />
        ) : (
          /* Form View */
          <>
            {txStatus.state === 'error' && (
              <Alert variant="error">
                <div className="space-y-1">
                  <div className="font-medium">Withdrawal failed</div>
                  {'message' in txStatus && txStatus.message && (
                    <div className="text-sm font-normal opacity-90">{txStatus.message}</div>
                  )}
                </div>
              </Alert>
            )}

            {/* Network Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-gray-700">Network</span>
                <div className="flex items-center gap-2">
                  {(Object.keys(NETWORK_CONFIG) as NetworkType[]).map((network) => {
                    const config = NETWORK_CONFIG[network];
                    return (
                      <Image
                        key={network}
                        src={config.icon}
                        alt={`${config.name} logo`}
                        width={20}
                        height={20}
                        className="flex-shrink-0"
                      />
                    );
                  })}
                </div>
              </div>
              <NetworkSelector
                value={selectedNetwork}
                onChange={setSelectedNetwork}
                disabled={isInputDisabled()}
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-gray-700">Amount to Withdraw</span>
                <button
                  onClick={handleMaxAmount}
                  disabled={isInputDisabled()}
                  className="text-sm text-primary-500 font-medium hover:text-primary-600 disabled:opacity-50 disabled:text-gray-400 disabled:hover:text-gray-400"
                >
                  MAX
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  disabled={isInputDisabled()}
                  aria-label="Amount to withdraw"
                  className={cn(
                    'w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400',
                    'focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200',
                    isInputDisabled() && 'bg-gray-100 cursor-not-allowed'
                  )}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-gray-500">RSC</span>
                </div>
              </div>
              {isBelowMinimum && (
                <p className="text-sm text-red-600" role="alert">
                  Minimum withdrawal amount is {MIN_WITHDRAWAL_AMOUNT} RSC.
                </p>
              )}
              {hasInsufficientBalance && (
                <p className="text-sm text-red-600" role="alert">
                  Withdrawal amount exceeds your available balance.
                </p>
              )}
            </div>

            {/* Fee Display */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              {feeError ? (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Unable to fetch fee: {feeError}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isFeeLoading ? (
                        <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">
                      A network fee of{' '}
                      {isFeeLoading ? (
                        <Skeleton className="inline-block h-4 w-8 align-middle" />
                      ) : (
                        <span>{fee}</span>
                      )}{' '}
                      RSC will be deducted from your withdrawal amount.
                    </p>
                  </div>

                  {withdrawAmount > 0 && (fee || isFeeLoading) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">You will receive:</span>
                        <div className="flex items-center gap-1">
                          <ResearchCoinIcon size={16} />
                          {isFeeLoading ? (
                            <Skeleton className="h-4 w-16" />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">
                              {formatRSC({ amount: amountUserWillReceive })}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">RSC</span>
                        </div>
                      </div>
                      {!isFeeLoading && amountUserWillReceive <= 0 && withdrawAmount > 0 && fee && (
                        <p className="text-xs text-red-600 mt-1">
                          Withdrawal amount must be greater than the network fee.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Withdrawal Address Display */}
            <div className="space-y-2">
              <Input
                label="Withdrawal Address"
                value={address || ''}
                readOnly
                disabled
                className="bg-gray-50 font-mono text-sm pr-0"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                rightElement={
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-2 px-4 py-2 h-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors border-l border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-r-lg flex-shrink-0"
                    type="button"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              {/* Network Compatibility Warning */}
              <Alert variant="warning" className="mt-2">
                <div className="font-medium">
                  Ensure your wallet supports {NETWORK_CONFIG[selectedNetwork].name}
                </div>
              </Alert>
            </div>

            {/* Balance Display */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Balance:</span>
                <div className="text-right flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <ResearchCoinIcon size={16} />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatRSC({ amount: availableBalance })}
                    </span>
                    <span className="text-sm text-gray-500">RSC</span>
                  </div>
                </div>
              </div>

              <div className="my-2 border-t border-gray-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">After Withdrawal:</span>
                <div className="text-right flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <ResearchCoinIcon size={16} />
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        withdrawAmount > 0 ? 'text-red-600' : 'text-gray-900'
                      )}
                    >
                      {withdrawAmount > 0
                        ? formatRSC({ amount: calculateNewBalance() })
                        : formatRSC({ amount: availableBalance })}
                    </span>
                    <span className="text-sm text-gray-500">RSC</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}
