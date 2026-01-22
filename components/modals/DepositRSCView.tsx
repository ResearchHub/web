'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount } from 'wagmi';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Interface } from 'ethers';
import { TransactionService } from '@/services/transaction.service';
import { getRSCForNetwork, NetworkType, TRANSFER_ABI, NETWORK_CONFIG } from '@/constants/tokens';
import { NetworkSelector } from '@/components/ui/NetworkSelector';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { WalletDefault } from '@coinbase/onchainkit/wallet';

const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV || HOT_WALLET_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

type Call = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

interface DepositRSCViewProps {
  currentBalance: number;
  onSuccess?: () => void;
}

type TransactionStatus =
  | { state: 'idle' }
  | { state: 'buildingTransaction' }
  | { state: 'pending'; txHash?: string }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

/**
 * Inline RSC deposit view for use within the contribution modal.
 * Renders the same content as DepositModal but without the modal wrapper.
 */
export function DepositRSCView({ currentBalance, onSuccess }: DepositRSCViewProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('BASE');
  const [isInitiating, setIsDepositButtonDisabled] = useState(false);
  const { address } = useAccount();
  const { balance: walletBalance, isLoading: isWalletBalanceLoading } = useWalletRSCBalance({
    network: selectedNetwork,
  });
  const isMobile = useIsMobile();
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const hasCalledSuccessRef = useRef(false);
  const hasProcessedDepositRef = useRef(false);
  const processedTxHashRef = useRef<string | null>(null);

  const rscToken = useMemo(() => getRSCForNetwork(selectedNetwork), [selectedNetwork]);
  const networkConfig = NETWORK_CONFIG[selectedNetwork];
  const blockExplorerUrl = networkConfig.explorerUrl;

  useEffect(() => {
    // Reset state on mount
    setTxStatus({ state: 'idle' });
    setAmount('');
    setSelectedNetwork('BASE');
    setIsDepositButtonDisabled(false);
    hasCalledSuccessRef.current = false;
    hasProcessedDepositRef.current = false;
    processedTxHashRef.current = null;
  }, []);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const depositAmount = useMemo(() => parseInt(amount || '0', 10), [amount]);

  const calculateNewBalance = useCallback(
    (): number => currentBalance + depositAmount,
    [currentBalance, depositAmount]
  );

  const isButtonDisabled = useMemo(
    () =>
      !address ||
      !amount ||
      depositAmount <= 0 ||
      depositAmount > walletBalance ||
      isInitiating ||
      isMobile,
    [address, amount, depositAmount, walletBalance, isInitiating, isMobile]
  );

  const isInputDisabled = useCallback(() => {
    return (
      !address ||
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending' ||
      txStatus.state === 'success' ||
      isMobile
    );
  }, [address, txStatus.state, isMobile]);

  const setButtonDisabledOnClick = useCallback(() => {
    setIsDepositButtonDisabled(true);
  }, []);

  const handleOnStatus = useCallback(
    (status: any) => {
      if (status.statusName === 'buildingTransaction') {
        setTxStatus({ state: 'buildingTransaction' });
        return;
      }

      if (status.statusName === 'transactionPending') {
        setTxStatus({ state: 'pending' });
        return;
      }

      if (
        status.statusName === 'transactionLegacyExecuted' &&
        status.statusData?.transactionHashList?.[0]
      ) {
        const txHash = status.statusData.transactionHashList[0];
        setTxStatus({ state: 'pending', txHash });
        return;
      }

      if (
        status.statusName === 'success' &&
        status.statusData?.transactionReceipts?.[0]?.transactionHash
      ) {
        const txHash = status.statusData.transactionReceipts[0].transactionHash;
        setTxStatus({ state: 'success', txHash });

        if (!hasProcessedDepositRef.current && processedTxHashRef.current !== txHash) {
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address!,
            network: selectedNetwork,
          }).catch((error) => {
            console.error('Failed to record deposit:', error);
          });
        }

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
        return;
      }

      if (status.statusName === 'error') {
        setTxStatus({
          state: 'error',
          message: status.statusData?.message || 'Transaction failed',
        });
        setIsDepositButtonDisabled(false);
      }
    },
    [depositAmount, address, onSuccess, selectedNetwork]
  );

  const callsCallback = useCallback(async () => {
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('Invalid deposit amount');
    }
    if (depositAmount > walletBalance) {
      throw new Error('Deposit amount exceeds wallet balance');
    }

    const amountInWei = BigInt(depositAmount) * BigInt(10 ** 18);

    const transferInterface = new Interface(TRANSFER_ABI);
    const encodedData = transferInterface.encodeFunctionData('transfer', [
      HOT_WALLET_ADDRESS,
      amountInWei.toString(),
    ]);

    const transferCall: Call = {
      to: rscToken.address as `0x${string}`,
      data: encodedData as `0x${string}`,
    };

    return [transferCall];
  }, [depositAmount, walletBalance, rscToken.address]);

  // Show connect wallet if not connected
  if (!address) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Connect your wallet to deposit RSC to your ResearchHub account.
        </p>
        <WalletDefault />
      </div>
    );
  }

  // Success state
  if (txStatus.state === 'success') {
    const txHash = 'txHash' in txStatus ? txStatus.txHash : undefined;
    return (
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Deposit Successful</h3>
          <p className="text-sm text-gray-600 mt-1">
            {depositAmount.toLocaleString()} RSC has been deposited to your account.
          </p>
        </div>
        {txHash && (
          <a
            href={`${blockExplorerUrl}/tx/${txHash.startsWith('0x') ? txHash : `0x${txHash}`}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Transaction
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  const isSponsored = selectedNetwork === 'BASE';

  return (
    <div className="space-y-5">
      {txStatus.state === 'error' && (
        <Alert variant="error">
          <div className="space-y-1">
            <div className="font-medium">Deposit failed</div>
            {'message' in txStatus && txStatus.message && (
              <div className="text-sm font-normal opacity-90">{txStatus.message}</div>
            )}
          </div>
        </Alert>
      )}

      {isMobile && (
        <Alert variant="warning">
          Deposits are temporarily unavailable on mobile devices. Please use a desktop browser.
        </Alert>
      )}

      {/* Network Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Network</span>
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
          showBadges={false}
        />
      </div>

      {/* Wallet RSC Balance */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Wallet Balance:</span>
          <div className="flex items-center gap-2">
            <ResearchCoinIcon size={16} />
            {isWalletBalanceLoading ? (
              <span className="text-sm font-semibold text-gray-400">Loading...</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-gray-900">
                  {walletBalance.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">RSC</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Amount to Deposit</span>
          <button
            onClick={() => setAmount(Math.floor(walletBalance).toString())}
            className="text-sm text-primary-500 font-medium hover:text-primary-600 disabled:opacity-50 disabled:text-gray-400"
            disabled={isInputDisabled()}
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
            className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200 ${isInputDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-gray-500">RSC</span>
          </div>
        </div>
        {depositAmount > walletBalance && (
          <p className="text-sm text-red-600">Deposit amount exceeds your wallet balance.</p>
        )}
      </div>

      {/* Balance Display */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Balance:</span>
          <div className="flex items-center gap-2">
            <ResearchCoinIcon size={16} />
            <span className="text-sm font-semibold text-gray-900">
              {formatRSC({ amount: currentBalance })}
            </span>
            <span className="text-sm text-gray-500">RSC</span>
          </div>
        </div>

        <div className="my-2 border-t border-gray-200" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">After Deposit:</span>
          <div className="flex items-center gap-2">
            <ResearchCoinIcon size={16} />
            <span
              className={`text-sm font-semibold ${depositAmount > 0 && depositAmount <= walletBalance ? 'text-green-600' : 'text-gray-900'}`}
            >
              {depositAmount > 0 && depositAmount <= walletBalance
                ? formatRSC({ amount: calculateNewBalance() })
                : formatRSC({ amount: currentBalance })}
            </span>
            <span className="text-sm text-gray-500">RSC</span>
          </div>
        </div>
      </div>

      {/* Deposit Button */}
      <Transaction
        isSponsored={isSponsored}
        chainId={rscToken.chainId}
        calls={callsCallback}
        onStatus={handleOnStatus}
      >
        <div onClick={setButtonDisabledOnClick} role="presentation">
          <TransactionButton
            className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            disabled={isButtonDisabled}
            text="Deposit RSC"
            pendingOverride={{
              text: (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {txStatus.state === 'pending' ? 'Processing...' : 'Building transaction...'}
                </span>
              ),
            }}
          />
        </div>
      </Transaction>
    </div>
  );
}
