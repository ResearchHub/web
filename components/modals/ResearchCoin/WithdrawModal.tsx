'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Check, AlertCircle, Loader2, Copy } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount } from 'wagmi';
import { useWithdrawRSC } from '@/hooks/useWithdrawRSC';
import { cn } from '@/utils/styles';
import { NETWORK_CONFIG, NetworkType } from '@/constants/tokens';
import { NetworkSelectorSection } from './shared/NetworkSelectorSection';
import { BalanceDisplay } from './shared/BalanceDisplay';
import { TransactionFooter } from './shared/TransactionFooter';
import { Skeleton } from '@/components/ui/Skeleton';
import { CurrencyInput } from '@/components/ui/form/CurrencyInput';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { WithdrawalSuccessView } from './WithdrawalSuccessView';
import { isValidEthereumAddress } from '@/utils/stringUtils';
import { useCopyAddress } from '@/hooks/useCopyAddress';

// Minimum withdrawal amount in RSC
const MIN_WITHDRAWAL_AMOUNT = 150;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: () => void;
}

import { useAmountInput } from '@/hooks/useAmountInput';

export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: WithdrawModalProps) {
  const {
    amount: amountNum,
    setAmount: setAmountNum,
    handleAmountChange,
    getFormattedValue: getFormattedInputValue,
  } = useAmountInput();
  
  // Backwards compatibility
  const amount = amountNum === 0 ? '' : amountNum.toString();

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('BASE');
  const [addressMode, setAddressMode] = useState<'connected' | 'custom'>('connected');
  const [customAddress, setCustomAddress] = useState<string>('');
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
        setAddressMode('connected');
        setCustomAddress('');
        resetTransaction();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, resetTransaction]);

  const withdrawalAddress = useMemo(() => {
    return addressMode === 'connected' ? address : customAddress;
  }, [addressMode, address, customAddress]);

  const isCustomAddressValid = useMemo(() => {
    if (addressMode === 'connected') return true;
    return isValidEthereumAddress(customAddress);
  }, [addressMode, customAddress]);

  useEffect(() => {
    if (txStatus.state === 'error') {
      const errorMessage = 'message' in txStatus ? txStatus.message : 'Transaction failed';
      toast.error(errorMessage);
    }
  }, [txStatus]);

  useEffect(() => {
    if (feeError) {
      toast.error(`Unable to fetch fee: ${feeError}`);
    }
  }, [feeError]);

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
      amountUserWillReceive <= 0 ||
      !isCustomAddressValid ||
      !withdrawalAddress,
    [
      amount,
      withdrawAmount,
      txStatus.state,
      isFeeLoading,
      fee,
      hasInsufficientBalance,
      isBelowMinimum,
      amountUserWillReceive,
      isCustomAddressValid,
      withdrawalAddress,
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
    if (!withdrawalAddress || !amount || isButtonDisabled || !fee) {
      return;
    }

    const result = await withdrawRSC({
      to_address: withdrawalAddress,
      agreed_to_terms: true,
      amount: amount,
      network: selectedNetwork,
    });

    if (result && txStatus.state === 'success' && onSuccess) {
      onSuccess();
    }
  }, [
    withdrawalAddress,
    amount,
    isButtonDisabled,
    withdrawRSC,
    txStatus.state,
    onSuccess,
    fee,
    selectedNetwork,
  ]);

  const { isCopied: isAddressCopied, copyAddress } = useCopyAddress();

  const handleCopyAddress = useCallback(() => {
    copyAddress(withdrawalAddress);
  }, [withdrawalAddress, copyAddress]);

  const handleCustomAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAddress(e.target.value);
  }, []);

  const footer = useMemo(() => {
    const txHash = txStatus.state === 'success' ? txStatus.txHash : undefined;

    if (txHash) {
      return <TransactionFooter txHash={txHash} blockExplorerUrl={blockExplorerUrl} />;
    }

    return (
      <TransactionFooter blockExplorerUrl={blockExplorerUrl}>
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
      </TransactionFooter>
    );
  }, [txStatus, blockExplorerUrl, isButtonDisabled, handleWithdraw, isFeeLoading]);

  if (!address) {
    return null;
  }

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
            address={withdrawalAddress || ''}
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
            <NetworkSelectorSection
              selectedNetwork={selectedNetwork}
              onNetworkChange={setSelectedNetwork}
              disabled={isInputDisabled()}
            />

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
                <CurrencyInput
                  value={getFormattedInputValue()}
                  onChange={handleAmountChange}
                  error={
                    isBelowMinimum
                      ? `Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} RSC.`
                      : hasInsufficientBalance
                        ? 'Withdrawal amount exceeds your available balance.'
                        : undefined
                  }
                  currency="RSC"
                  onCurrencyToggle={handleCurrencyToggle}
                  label=""
                  className={isInputDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
              </div>
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

            {/* Withdrawal Address */}
            <div className="space-y-3">
              <span className="text-[15px] text-gray-700">Withdrawal Address</span>

              {/* Address Mode Toggle */}
              <Checkbox
                id="useConnectedWallet"
                label="Use my connected wallet"
                checked={addressMode === 'connected'}
                onCheckedChange={(checked) => {
                  if (!isInputDisabled()) {
                    setAddressMode(checked ? 'connected' : 'custom');
                  }
                }}
                disabled={isInputDisabled()}
              />

              {/* Address Input */}
              {addressMode === 'connected' ? (
                <Input
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
                      {isAddressCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  <Input
                    value={customAddress}
                    onChange={handleCustomAddressChange}
                    placeholder="0x..."
                    disabled={isInputDisabled()}
                    className={cn(
                      'font-mono text-sm',
                      customAddress &&
                        !isCustomAddressValid &&
                        'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    rightElement={
                      customAddress && (
                        <button
                          onClick={handleCopyAddress}
                          className="flex items-center gap-2 px-4 py-2 h-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors border-l border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-r-lg flex-shrink-0"
                          type="button"
                        >
                          {isAddressCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )
                    }
                  />
                  {customAddress && !isCustomAddressValid && (
                    <p className="text-sm text-red-600" role="alert">
                      Please enter a valid Ethereum address (0x followed by 40 hex characters).
                    </p>
                  )}
                </div>
              )}

              {/* Network Compatibility Warning */}
              <Alert variant="warning">
                <div className="font-medium">
                  Ensure the destination wallet supports {NETWORK_CONFIG[selectedNetwork].name}
                </div>
              </Alert>
            </div>

            {/* Balance Display */}
            <BalanceDisplay
              currentBalance={availableBalance}
              futureBalance={withdrawAmount > 0 ? calculateNewBalance() : availableBalance}
              futureBalanceLabel="After Withdrawal"
              futureBalanceColor={withdrawAmount > 0 ? 'red' : 'gray'}
            />
          </>
        )}
      </div>
    </BaseModal>
  );
}
