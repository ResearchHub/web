'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { X as XIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Interface } from 'ethers';
import { TransactionService } from '@/services/transaction.service';
import { RSC, TRANSFER_ABI } from '@/constants/tokens';
import { usePublicClient } from 'wagmi';

const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV || HOT_WALLET_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

// Network configuration based on environment
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const NETWORK_DESCRIPTION = IS_PRODUCTION
  ? 'Deposits are processed on Base L2'
  : 'Deposits are processed on Base Sepolia testnet';

// Define types for blockchain transaction call
type Call = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
}

// Define transaction status type to include all relevant states
type TransactionStatus =
  | { state: 'idle' }
  | { state: 'buildingTransaction' }
  | { state: 'pending'; txHash?: string }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

export function DepositModal({ isOpen, onClose, currentBalance, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { address } = useAccount();
  const { balance: walletBalance } = useWalletRSCBalance();
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const hasCalledSuccessRef = useRef(false);
  const hasProcessedDepositRef = useRef(false);
  const processedTxHashRef = useRef<string | null>(null);
  const isMobile = useIsMobile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const publicClient = usePublicClient();
  const lastCheckedBlockRef = useRef<bigint | null>(null);

  // Helper to add debug logs (only on mobile)
  const addDebugLog = useCallback(
    (message: string) => {
      if (isMobile) {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLogs((prev) => [...prev.slice(-9), `${timestamp}: ${message}`]); // Keep last 10
        console.log('[DepositModal]', message);
      } else {
        console.log('[DepositModal]', message);
      }
    },
    [isMobile]
  );

  // Mobile: Function to check for recent transactions from this wallet
  const checkForRecentTransaction = useCallback(async () => {
    if (!publicClient || !address) {
      addDebugLog('No publicClient or address for polling');
      return null;
    }

    try {
      addDebugLog('Checking blockchain for recent transactions...');

      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();
      addDebugLog(`Current block: ${currentBlock}`);

      // Get transaction count to see if any new transactions
      const txCount = await publicClient.getTransactionCount({ address, blockTag: 'latest' });
      const pendingTxCount = await publicClient.getTransactionCount({
        address,
        blockTag: 'pending',
      });

      addDebugLog(`Tx count - confirmed: ${txCount}, pending: ${pendingTxCount}`);

      if (pendingTxCount > txCount) {
        addDebugLog('Transaction still pending in mempool...');
        return 'pending';
      }

      // Check last 10 blocks for transactions (Base has ~2 second block time, so this covers ~20 seconds)
      const blocksToCheck = 10;
      addDebugLog(`Checking last ${blocksToCheck} blocks...`);

      for (let i = 0; i < blocksToCheck; i++) {
        const blockNumber = currentBlock - BigInt(i);

        try {
          const block = await publicClient.getBlock({
            blockNumber,
            includeTransactions: true,
          });

          if (block.transactions && Array.isArray(block.transactions)) {
            for (const tx of block.transactions) {
              if (typeof tx === 'object' && tx.from?.toLowerCase() === address.toLowerCase()) {
                const txHash = tx.hash;

                // Check if it's to the RSC token contract (ERC20 transfer)
                if (tx.to?.toLowerCase() === RSC.address.toLowerCase()) {
                  addDebugLog(`✓ Found RSC tx in block ${blockNumber}: ${txHash.slice(0, 10)}...`);
                  return txHash;
                }
              }
            }
          }
        } catch (blockError) {
          addDebugLog(
            `Error checking block ${blockNumber}: ${blockError instanceof Error ? blockError.message : blockError}`
          );
        }
      }

      addDebugLog(`No RSC transaction found in last ${blocksToCheck} blocks`);
      return null;
    } catch (error) {
      addDebugLog(`Error checking blockchain: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }, [publicClient, address, addDebugLog]);

  // Reset transaction status when modal is closed
  useEffect(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    hasCalledSuccessRef.current = false;
    hasProcessedDepositRef.current = false;
    processedTxHashRef.current = null;
    setIsProcessing(false);
    setDebugLogs([]);
    lastCheckedBlockRef.current = null;
  }, [isOpen]);

  // Mobile: Detect when user returns from Coinbase Wallet app
  useEffect(() => {
    if (!isMobile || !isOpen || txStatus.state !== 'pending') {
      return;
    }

    addDebugLog('Setting up mobile visibility listener');

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        addDebugLog('User returned to page');

        // Mobile: Immediately close any OnchainKit modals/popups when returning from wallet
        if (isMobile) {
          addDebugLog('Attempting to close OnchainKit popup...');

          // Strategy: Find ANY fixed/absolute positioned element with wallet text
          const allElements = document.querySelectorAll('div, aside, section');
          let foundCount = 0;

          allElements.forEach((el) => {
            if (!(el instanceof HTMLElement)) return;

            const styles = window.getComputedStyle(el);
            const isPositioned = styles.position === 'fixed' || styles.position === 'absolute';
            const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden';
            const hasHighZIndex = parseInt(styles.zIndex || '0') > 40; // Our modal is z-50

            if (isPositioned && isVisible && hasHighZIndex) {
              const text = el.textContent || '';
              const isDepositModal = text.includes('Deposit RSC');
              const isWalletPopup =
                text.includes('Redirecting to Coinbase Wallet') || text.includes('Open in Wallet');

              if (isWalletPopup && !isDepositModal) {
                foundCount++;
                addDebugLog(`Found wallet popup (z-index: ${styles.zIndex})`);
                el.style.display = 'none';

                // Also hide parent if it's positioned
                let parent = el.parentElement;
                let depth = 0;
                while (parent && parent !== document.body && depth < 3) {
                  const parentStyles = window.getComputedStyle(parent);
                  if (parentStyles.position === 'fixed' || parentStyles.position === 'absolute') {
                    parent.style.display = 'none';
                    addDebugLog('Hid parent too');
                    break;
                  }
                  parent = parent.parentElement;
                  depth++;
                }
              }
            }
          });

          addDebugLog(`✓ Found and closed ${foundCount} wallet popups`);
        }

        addDebugLog(
          `txStatus: ${txStatus.state}, hasHash: ${!!txStatus.txHash}, processed: ${hasProcessedDepositRef.current}`
        );

        // If we have a pending transaction with a hash, process it
        if (txStatus.state === 'pending' && txStatus.txHash && !hasProcessedDepositRef.current) {
          const currentTxHash = txStatus.txHash;
          const currentAmount = parseInt(amount || '0', 10);

          addDebugLog(`Has hash: Processing with ${currentTxHash.slice(0, 10)}...`);
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = currentTxHash;

          TransactionService.saveDeposit({
            amount: currentAmount,
            transaction_hash: currentTxHash,
            from_address: address!,
            network: 'BASE',
          })
            .then(() => {
              addDebugLog('API success!');

              // Force state updates to trigger re-render
              setIsProcessing(false);
              setTxStatus({ state: 'success', txHash: currentTxHash });

              // Force a re-render to ensure UI updates
              setTimeout(() => {
                setTxStatus({ state: 'success', txHash: currentTxHash });
              }, 0);

              if (onSuccess && !hasCalledSuccessRef.current) {
                hasCalledSuccessRef.current = true;
                onSuccess();
              }
            })
            .catch((error) => {
              addDebugLog(`API error: ${error.message || error}`);
              setIsProcessing(false);
            });
          return;
        }

        // If we don't have a hash yet, try to find the transaction on-chain
        if (txStatus.state === 'pending' && !txStatus.txHash && !hasProcessedDepositRef.current) {
          addDebugLog('No hash yet - checking blockchain...');

          // Retry mechanism - try up to 5 times with 3 second intervals
          const maxRetries = 5;
          let retryCount = 0;

          const pollForTransaction = async () => {
            retryCount++;
            addDebugLog(`Polling attempt ${retryCount}/${maxRetries}...`);

            const result = await checkForRecentTransaction();

            if (result && result !== 'pending') {
              // Found a transaction hash!
              const txHash = result;
              const currentAmount = parseInt(amount || '0', 10);

              addDebugLog(`Found on blockchain: ${txHash.slice(0, 10)}...`);
              hasProcessedDepositRef.current = true;
              processedTxHashRef.current = txHash;
              setTxStatus({ state: 'pending', txHash });

              TransactionService.saveDeposit({
                amount: currentAmount,
                transaction_hash: txHash,
                from_address: address!,
                network: 'BASE',
              })
                .then(() => {
                  addDebugLog('✓ Deposit processed successfully!');

                  // Force state updates to trigger re-render
                  setIsProcessing(false);
                  setTxStatus({ state: 'success', txHash });

                  // Force a re-render to ensure UI updates
                  setTimeout(() => {
                    setTxStatus({ state: 'success', txHash });
                  }, 0);

                  if (onSuccess && !hasCalledSuccessRef.current) {
                    hasCalledSuccessRef.current = true;
                    onSuccess();
                  }
                })
                .catch((error) => {
                  addDebugLog(`API error: ${error.message || error}`);
                  setIsProcessing(false);
                });
            } else if (result === 'pending') {
              addDebugLog('Tx still in mempool, waiting...');
              if (retryCount < maxRetries) {
                setTimeout(pollForTransaction, 3000);
              } else {
                addDebugLog('Max retries reached - tx may still be pending');
              }
            } else {
              // Not found, retry
              if (retryCount < maxRetries) {
                addDebugLog(`Not found yet, retrying in 3s...`);
                setTimeout(pollForTransaction, 3000);
              } else {
                addDebugLog('Max retries - tx not found. Try refreshing balance.');
              }
            }
          };

          pollForTransaction();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [
    isMobile,
    isOpen,
    txStatus,
    amount,
    address,
    onSuccess,
    addDebugLog,
    checkForRecentTransaction,
  ]);

  // Handle custom close with state reset
  const handleClose = useCallback(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    onClose();
  }, [onClose]);

  // Handle amount input change with validation
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // Memoize derived values
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
      (isMobile && isProcessing),
    [address, amount, depositAmount, walletBalance, isMobile, isProcessing]
  );

  // Function to check if inputs should be disabled
  const isInputDisabled = useCallback(() => {
    return (
      !address ||
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending' ||
      txStatus.state === 'success'
    );
  }, [address, txStatus.state]);

  const handleOnStatus = useCallback(
    (status: any) => {
      console.log(
        '[DepositModal] Transaction status:',
        status.statusName,
        'isMobile:',
        isMobile,
        status
      );

      // Handle building/pending states
      if (status.statusName === 'buildingTransaction') {
        console.log('[DepositModal] Building transaction...');
        setTxStatus({ state: 'buildingTransaction' });
        return;
      }

      if (status.statusName === 'transactionPending') {
        console.log('[DepositModal] Transaction pending...');
        setTxStatus({ state: 'pending' });
        return;
      }

      if (
        status.statusName === 'transactionLegacyExecuted' &&
        status.statusData?.transactionHashList?.[0]
      ) {
        const txHash = status.statusData.transactionHashList[0];
        console.log(
          '[DepositModal] transactionLegacyExecuted received, txHash:',
          txHash,
          'isMobile:',
          isMobile
        );
        setTxStatus({ state: 'pending', txHash });

        // Mobile: Process deposit immediately when we have the real transaction hash
        if (isMobile && !hasProcessedDepositRef.current) {
          console.log('[DepositModal] Mobile: Processing deposit immediately with hash:', txHash);
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address!,
            network: 'BASE',
          })
            .then(() => {
              console.log(
                '[DepositModal] Mobile: Deposit API call successful, setting success state'
              );
              setTxStatus({ state: 'success', txHash });
              if (onSuccess && !hasCalledSuccessRef.current) {
                hasCalledSuccessRef.current = true;
                onSuccess();
              }
            })
            .catch((error) => {
              console.error('[DepositModal] Mobile: Failed to process deposit:', error);
              setTxStatus({
                state: 'error',
                message: 'Failed to record deposit. Please contact support.',
              });
            });
        } else {
          console.log(
            '[DepositModal] Skipping mobile processing - already processed or not mobile'
          );
        }

        return;
      }

      if (
        status.statusName === 'success' &&
        status.statusData?.transactionReceipts?.[0]?.transactionHash
      ) {
        const txHash = status.statusData.transactionReceipts[0].transactionHash;

        // Set success state regardless of whether we've processed it
        setTxStatus({ state: 'success', txHash });

        // Desktop: Process deposit on success (Mobile already processed in transactionLegacyExecuted)
        if (!isMobile && !hasProcessedDepositRef.current && processedTxHashRef.current !== txHash) {
          console.log('Desktop: Processing deposit for transaction:', txHash);

          // Mark as processed first to prevent race conditions
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address!,
            network: 'BASE',
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
        console.error('Transaction error full status:', JSON.stringify(status, null, 2));
        setTxStatus({
          state: 'error',
          message: status.statusData?.message || 'Transaction failed',
        });
      }
    },
    [depositAmount, address, onSuccess, isMobile, addDebugLog]
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

    // Cast the result to Call type with proper hex type
    const transferCall: Call = {
      to: RSC.address as `0x${string}`,
      data: encodedData as `0x${string}`,
    };

    return [transferCall];
  }, [amount, depositAmount, walletBalance, isMobile, address]);

  // If no wallet is connected, show nothing - assuming modal shouldn't open in this state
  if (!address) {
    return null;
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Deposit RSC
                    </DialogTitle>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                      aria-label="Close"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Network Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-md">
                      <div className="flex items-center gap-3">
                        <img
                          src="/base-logo.svg"
                          alt={`${NETWORK_NAME} Network`}
                          className="h-6 w-6"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{NETWORK_NAME}</span>
                          <span className="text-xs text-gray-500">{NETWORK_DESCRIPTION}</span>
                        </div>
                      </div>
                    </div>

                    {/* Wallet RSC Balance */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wallet Balance:</span>
                        <div className="flex items-center gap-2">
                          <ResearchCoinIcon size={16} />
                          <span className="text-sm font-semibold text-gray-900">
                            {walletBalance.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">RSC</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[15px] text-gray-700">Amount to Deposit</span>
                        <button
                          onClick={() => setAmount(Math.floor(walletBalance).toString())}
                          className="text-sm text-primary-500 font-medium hover:text-primary-600 disabled:opacity-50 disabled:text-gray-400 disabled:hover:text-gray-400"
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
                          aria-label="Amount to deposit"
                          className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200 ${isInputDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-500">RSC</span>
                        </div>
                      </div>
                      {depositAmount > walletBalance && (
                        <p className="text-sm text-red-600" role="alert">
                          Deposit amount exceeds your wallet balance.
                        </p>
                      )}
                    </div>

                    {/* Balance Display */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Balance:</span>
                        <div className="text-right flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <ResearchCoinIcon size={16} />
                            <span className="text-sm font-semibold text-gray-900">
                              {formatRSC({ amount: currentBalance })}
                            </span>
                            <span className="text-sm text-gray-500">RSC</span>
                          </div>
                        </div>
                      </div>

                      <div className="my-2 border-t border-gray-200" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">After Deposit:</span>
                        <div className="text-right flex items-center gap-2">
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
                    </div>

                    {/* Transaction Button */}
                    {txStatus.state !== 'success' && txStatus.state !== 'error' && (
                      <Transaction
                        isSponsored={true}
                        chainId={RSC.chainId}
                        calls={callsCallback}
                        onStatus={handleOnStatus}
                      >
                        {isMobile && isProcessing ? (
                          // Mobile: Show custom loading button immediately when processing starts
                          <button
                            disabled
                            className="w-full h-12 bg-primary-400 text-white rounded-lg font-medium transition-colors opacity-75 cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                          >
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                          </button>
                        ) : (
                          <div
                            onClick={() => {
                              // Mobile: Set processing immediately on click (step 1)
                              if (isMobile && !isProcessing) {
                                addDebugLog('Button clicked - processing starts');
                                setIsProcessing(true);
                              }
                            }}
                          >
                            <TransactionButton
                              className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                              disabled={isButtonDisabled || txStatus.state === 'pending'}
                              text={'Deposit RSC'}
                            />
                          </div>
                        )}
                      </Transaction>
                    )}

                    {/* Mobile Debug Panel */}
                    {isMobile && debugLogs.length > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-gray-900 text-white text-xs font-mono max-h-40 overflow-y-auto">
                        <div className="font-bold mb-2 text-green-400">
                          🔍 Debug Logs (Mobile Only):
                        </div>
                        {debugLogs.map((log, idx) => (
                          <div key={idx} className="mb-1">
                            {log}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transaction Status Display */}
                    {(txStatus.state === 'success' || txStatus.state === 'error') && (
                      <div className="mt-4 p-4 rounded-lg border">
                        {txStatus.state === 'success' && (
                          <div className="space-y-2">
                            <div className="flex items-center text-green-600">
                              <Check className="mr-2 h-5 w-5" />
                              <span className="font-medium">Deposit successful!</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              It can take up to 10-20 minutes for the deposit to appear in your
                              account.
                            </p>
                          </div>
                        )}

                        {txStatus.state === 'error' && (
                          <div className="space-y-2">
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="mr-2 h-5 w-5" />
                              <span className="font-medium">Deposit failed</span>
                            </div>
                            <p className="text-sm text-gray-600">{txStatus.message}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
