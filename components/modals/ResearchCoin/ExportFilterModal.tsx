'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, FileDown, Loader2 } from 'lucide-react';
import { TransactionService } from '@/services/transaction.service';
import toast from 'react-hot-toast';

interface ExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportStateChange: (isExporting: boolean) => void;
}

const EXPORT_STAGES = [
  'Starting export...',
  'Gathering your transactions...',
  'Processing transaction data...',
  'Calculating USD values...',
  'Preparing CSV file...',
  'Almost done...',
] as const;

const STAGE_INTERVALS = [
  1000, // Starting export
  2000, // Gathering transactions
  2000, // Processing data
  2000, // Calculating USD values
  2000, // Preparing CSV
  1000, // Almost done
] as const;

export function ExportFilterModal({
  isOpen,
  onClose,
  onExportStateChange,
}: ExportFilterModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const hasStartedExport = useRef(false);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Progress simulation and export handling
  useEffect(() => {
    if (!isOpen) {
      hasStartedExport.current = false;
      setCurrentStage(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      return;
    }

    const startExport = async () => {
      if (hasStartedExport.current) return;
      hasStartedExport.current = true;
      onExportStateChange(true);

      try {
        // Start the API call immediately
        const exportPromise = TransactionService.exportTransactionsCSV();

        // Start the progress simulation
        let stage = 0;
        const advanceStage = () => {
          if (stage < EXPORT_STAGES.length - 1) {
            stage++;
            setCurrentStage(stage);
          }
        };

        // Schedule the stage updates
        let totalDelay = 0;
        for (let i = 0; i < STAGE_INTERVALS.length - 1; i++) {
          totalDelay += STAGE_INTERVALS[i];
          setTimeout(advanceStage, totalDelay);
        }

        // Wait for the export to complete
        const blob = await exportPromise;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `researchcoin-transactions-${new Date().toISOString().split('T')[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        // Show final stage and close
        setCurrentStage(EXPORT_STAGES.length - 1);
        setTimeout(() => {
          onClose();
          onExportStateChange(false);
          toast.success('Successfully exported transactions');
        }, 1000);
      } catch (error) {
        console.error('Error exporting transactions:', error);
        toast.error('Failed to export transactions');
        onExportStateChange(false);
        onClose();
      }
    };

    startExport();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isOpen, onClose, onExportStateChange]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileDown className="h-6 w-6 text-primary-400" />
                  <Dialog.Title className="text-xl font-semibold text-gray-800">
                    Exporting Transactions
                  </Dialog.Title>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 text-primary-400 animate-spin mb-4" />
                  <p className="text-gray-600 text-center">{EXPORT_STAGES[currentStage]}</p>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Your download will begin automatically. This process usually takes about 10
                    seconds.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white 
                      border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
