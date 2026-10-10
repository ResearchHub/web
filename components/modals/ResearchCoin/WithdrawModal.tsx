'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  Check,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Copy,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BaseModal } from '@/components/ui/BaseModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { formatRSC, getMaxDecimalPlaces } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useWithdrawRSC } from '@/hooks/useWithdrawRSC';
import { cn } from '@/utils/styles';
import { NETWORK_CONFIG, NetworkType } from '@/constants/tokens';
import { TransactionFooter } from './shared/TransactionFooter';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { WithdrawalSuccessView } from './WithdrawalSuccessView';
import { isValidEthereumAddress } from '@/utils/stringUtils';
import { useCopyAddress } from '@/hooks/useCopyAddress';
import { AuthService } from '@/services/auth.service';

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
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);
  const [isMfaStatusLoading, setIsMfaStatusLoading] = useState<boolean>(true);
  const [mfaStatusError, setMfaStatusError] = useState<boolean>(false);
  const [showMfaConfirmation, setShowMfaConfirmation] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
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
        setDestinationAddress('');
        setMfaCode('');
        setIsMfaEnabled(false);
        setIsMfaStatusLoading(true);
        setMfaStatusError(false);
        setShowMfaConfirmation(false);
        resetTransaction();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, resetTransaction]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsMfaStatusLoading(true);
    setMfaStatusError(false);
    AuthService.getMfaStatus()
      .then((status) => {
        if (!cancelled) {
          setIsMfaEnabled(!!status?.mfa_enabled);
          setIsMfaStatusLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMfaStatusError(true);
          setIsMfaStatusLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const isAddressValid = useMemo(() => {
    return isValidEthereumAddress(destinationAddress);
  }, [destinationAddress]);

  useEffect(() => {
    if (txStatus.state === 'error') {
      const errorMessage = 'message' in txStatus ? txStatus.message : 'Transaction failed';
      toast.error(errorMessage);
      setMfaCode('');
    }
  }, [txStatus]);

  useEffect(() => {
    if (feeError) {
      toast.error(`Unable to fetch fee: ${feeError}`);
    }
  }, [feeError]);

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

  const summaryDecimals = useMemo(() => {
    return getMaxDecimalPlaces(withdrawAmount, fee || 0, amountUserWillReceive);
  }, [withdrawAmount, fee, amountUserWillReceive]);

  const isBelowMinimum = useMemo(
    () => withdrawAmount > 0 && withdrawAmount < MIN_WITHDRAWAL_AMOUNT,
    [withdrawAmount]
  );

  // Check if user has enough balance for withdrawal
  const hasInsufficientBalance = useMemo(
    () => withdrawAmount > 0 && withdrawAmount > availableBalance,
    [withdrawAmount, availableBalance]
  );

  // Determine if the form is valid (to proceed to either MFA confirmation or direct withdrawal)
  const isFormValid = useMemo(
    () =>
      amount &&
      withdrawAmount > 0 &&
      txStatus.state !== 'pending' &&
      !isFeeLoading &&
      fee &&
      !hasInsufficientBalance &&
      !isBelowMinimum &&
      amountUserWillReceive > 0 &&
      isAddressValid &&
      destinationAddress &&
      !isMfaStatusLoading,
    [
      amount,
      withdrawAmount,
      txStatus.state,
      isFeeLoading,
      fee,
      hasInsufficientBalance,
      isBelowMinimum,
      amountUserWillReceive,
      isAddressValid,
      destinationAddress,
      isMfaStatusLoading,
    ]
  );

  // Determine if confirm button in MFA step should be disabled
  const isConfirmDisabled = useMemo(
    () => !isFormValid || (isMfaEnabled && !mfaCode.trim()) || txStatus.state === 'pending',
    [isFormValid, isMfaEnabled, mfaCode, txStatus.state]
  );

  const isInputDisabled = useCallback(() => {
    return txStatus.state === 'pending' || txStatus.state === 'success';
  }, [txStatus.state]);

  const handleMaxAmount = useCallback(() => {
    if (isInputDisabled() || !fee) return;
    // Max = available balance minus the network fee (so the user actually receives a positive amount).
    const maxWithdrawAmount = Math.max(0, Math.floor(availableBalance - fee));
    setAmount(maxWithdrawAmount.toString());
  }, [availableBalance, isInputDisabled, fee]);

  const handleWithdraw = useCallback(async () => {
    if (!destinationAddress || !amount || !isFormValid || !fee) {
      return;
    }

    const result = await withdrawRSC({
      to_address: destinationAddress,
      agreed_to_terms: true,
      amount: amount,
      network: selectedNetwork,
      ...(isMfaEnabled && mfaCode.trim() ? { mfa_code: mfaCode.trim() } : {}),
    });

    if (result && txStatus.state === 'success' && onSuccess) {
      onSuccess();
    }
  }, [
    destinationAddress,
    amount,
    isFormValid,
    withdrawRSC,
    txStatus.state,
    onSuccess,
    fee,
    selectedNetwork,
    isMfaEnabled,
    mfaCode,
  ]);

  const { isCopied: isAddressCopied, copyAddress } = useCopyAddress();

  const handleCopyAddress = useCallback(() => {
    copyAddress(destinationAddress);
  }, [destinationAddress, copyAddress]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationAddress(e.target.value);
  }, []);

  const footer = useMemo(() => {
    // Don't show footer if MFA is not enabled
    if (!isMfaEnabled) {
      return null;
    }

    const txHash = txStatus.state === 'success' ? txStatus.txHash : undefined;

    if (txHash) {
      return <TransactionFooter txHash={txHash} blockExplorerUrl={blockExplorerUrl} />;
    }

    // Verify Transaction step footer
    if (showMfaConfirmation) {
      return (
        <TransactionFooter blockExplorerUrl={blockExplorerUrl}>
          <Button
            onClick={handleWithdraw}
            disabled={isConfirmDisabled}
            className="w-full"
            size="lg"
          >
            {txStatus.state === 'pending' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Withdrawal'
            )}
          </Button>
        </TransactionFooter>
      );
    }

    // Main form footer
    return (
      <TransactionFooter blockExplorerUrl={blockExplorerUrl}>
        <div className="w-full flex flex-col items-center gap-2">
          <Button
            onClick={() => setShowMfaConfirmation(true)}
            disabled={!isFormValid}
            className="w-full"
            size="lg"
          >
            {isFeeLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading fee...
              </>
            ) : (
              'Continue'
            )}
          </Button>
          <p className="text-xs text-gray-500">Next: verify transaction</p>
        </div>
      </TransactionFooter>
    );
  }, [
    txStatus,
    blockExplorerUrl,
    isFormValid,
    isConfirmDisabled,
    handleWithdraw,
    isFeeLoading,
    showMfaConfirmation,
    isMfaEnabled,
  ]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        showMfaConfirmation && txStatus.state !== 'success' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMfaConfirmation(false)}
              disabled={txStatus.state === 'pending'}
              aria-label="Back"
              className="-ml-2 p-1 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <span>Verify Transaction</span>
          </div>
        ) : (
          'Withdraw RSC'
        )
      }
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
            address={destinationAddress || ''}
          />
        ) : showMfaConfirmation ? (
          /* MFA Confirmation View */
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

            {/* Withdrawal Summary */}
            <div className="text-sm">
              <SummaryRow
                label="Amount"
                value={
                  <>
                    <span className="font-medium text-gray-900">
                      {formatRSC({ amount: withdrawAmount, decimalPlaces: summaryDecimals })}
                    </span>
                    <span className="text-gray-500"> RSC</span>
                  </>
                }
              />
              <SummaryRow
                label="Network fee"
                value={
                  <>
                    <span className="text-gray-700">
                      −{formatRSC({ amount: fee || 0, decimalPlaces: summaryDecimals })}
                    </span>
                    <span className="text-gray-500"> RSC</span>
                  </>
                }
              />
              <SummaryRow
                label="To"
                value={
                  <span className="font-mono text-gray-800 break-all text-right max-w-[60%]">
                    {destinationAddress}
                  </span>
                }
              />
              <SummaryRow
                label="Network"
                value={
                  <span className="inline-flex items-center gap-1.5 text-gray-900">
                    <Image src={networkConfig.icon} alt="" width={14} height={14} />
                    {networkConfig.name}
                  </span>
                }
              />
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                <span className="font-semibold text-gray-900">You will receive</span>
                <div className="flex items-center gap-1">
                  <ResearchCoinIcon size={14} />
                  <span className="font-semibold text-gray-900">
                    {formatRSC({ amount: amountUserWillReceive, decimalPlaces: summaryDecimals })}
                  </span>
                  <span className="text-gray-500">RSC</span>
                </div>
              </div>
            </div>

            {/* Network compatibility — softer attention style */}
            <Alert
              variant="warning"
              className="bg-amber-50 border border-amber-200 text-amber-800"
              icon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
            >
              Verify your wallet supports {NETWORK_CONFIG[selectedNetwork].name}.
            </Alert>

            {/* MFA Code Input — only when MFA is enabled */}
            {isMfaEnabled && (
              <div className="space-y-2">
                <span className="text-[15px] text-gray-700">Authenticator code</span>
                <Input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  inputMode="numeric"
                  disabled={txStatus.state === 'pending'}
                  autoComplete="one-time-code"
                  autoCapitalize="none"
                  autoFocus
                />
                <p className="text-sm text-gray-500">
                  Enter the 6-digit code from your authenticator app to confirm this withdrawal.
                </p>
              </div>
            )}
          </>
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

            {mfaStatusError && (
              <Alert variant="warning">Could not verify MFA status. Please try again later.</Alert>
            )}

            {!isMfaStatusLoading && !mfaStatusError && !isMfaEnabled && (
              <div className="flex flex-col items-center text-center py-2 space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Two-factor authentication required
                  </h3>
                  <p className="text-sm text-gray-600 max-w-sm">
                    To protect your funds, withdrawals require two-factor authentication. Please
                    enable it in your account settings to continue.
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                  onClick={onClose}
                >
                  Enable 2FA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Form fields - only show when MFA is enabled */}
            {isMfaEnabled && (
              <>
                {/* Destination Address ("To") + inline network selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] text-gray-700">To</span>
                    <InlineNetworkPicker
                      value={selectedNetwork}
                      onChange={setSelectedNetwork}
                      disabled={isInputDisabled()}
                    />
                  </div>
                  <Input
                    value={destinationAddress}
                    onChange={handleAddressChange}
                    placeholder="0x..."
                    disabled={isInputDisabled()}
                    className={cn(
                      'font-mono text-sm',
                      destinationAddress &&
                        !isAddressValid &&
                        'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    rightElement={
                      destinationAddress && (
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
                  {destinationAddress && !isAddressValid ? (
                    <p className="text-sm text-red-600" role="alert">
                      Please enter a valid Ethereum address (0x followed by 40 hex characters).
                    </p>
                  ) : null}
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <span className="text-[15px] text-gray-700">Amount</span>
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Balance:{' '}
                      <span className="text-gray-700 font-medium">
                        {formatRSC({ amount: availableBalance })} RSC
                      </span>
                      {fee != null && !isFeeLoading && (
                        <span className="text-gray-400"> (− {fee} RSC fee)</span>
                      )}
                    </span>
                    <button
                      onClick={handleMaxAmount}
                      disabled={isInputDisabled() || isFeeLoading || !fee}
                      className="text-primary-500 font-semibold hover:text-primary-600 disabled:opacity-50 disabled:hover:text-primary-500"
                    >
                      MAX
                    </button>
                  </div>
                  {feeError && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Unable to fetch fee: {feeError}
                    </p>
                  )}
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
                  {!isFeeLoading && amountUserWillReceive <= 0 && withdrawAmount > 0 && fee && (
                    <p className="text-sm text-red-600" role="alert">
                      Withdrawal amount must be greater than the network fee.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 gap-3">
      <span className="text-gray-500">{label}</span>
      <div className="text-gray-900 text-right">{value}</div>
    </div>
  );
}

function InlineNetworkPicker({
  value,
  onChange,
  disabled,
}: {
  value: NetworkType;
  onChange: (n: NetworkType) => void;
  disabled?: boolean;
}) {
  const selected = NETWORK_CONFIG[value];
  return (
    <BaseMenu
      align="end"
      sideOffset={6}
      disabled={disabled}
      trigger={
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors px-2.5 py-1 text-xs font-medium text-gray-700 disabled:opacity-50',
            disabled && 'cursor-not-allowed'
          )}
        >
          <Image src={selected.icon} alt="" width={14} height={14} />
          {selected.name}
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </button>
      }
    >
      {(Object.keys(NETWORK_CONFIG) as NetworkType[]).map((network) => {
        const config = NETWORK_CONFIG[network];
        const isSelected = network === value;
        return (
          <BaseMenuItem
            key={network}
            onSelect={() => onChange(network)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md',
              isSelected && 'bg-primary-50'
            )}
          >
            <Image src={config.icon} alt="" width={18} height={18} />
            <span className="text-sm text-gray-900">{config.name}</span>
            {network === 'BASE' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                Lowest fees
              </span>
            )}
            {isSelected && <Check className="ml-auto h-4 w-4 text-primary-600" />}
          </BaseMenuItem>
        );
      })}
    </BaseMenu>
  );
}
