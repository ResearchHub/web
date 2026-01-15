'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UserModerationService } from '@/services/user-moderation.service';
import { UserFlag } from '@/types/moderation';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { USER_FLAG_REASON_METADATA, UserFlagReasonKey } from '@/constants/flags';

interface FlagHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: number;
}

export function FlagHistoryModal({ isOpen, onClose, authorId }: FlagHistoryModalProps) {
  const [flags, setFlags] = useState<UserFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && authorId) {
      setIsLoading(true);
      setError(null);
      UserModerationService.getFlagHistory(authorId.toString())
        .then((response) => {
          setFlags(response.flags);
        })
        .catch((err) => {
          console.error('Failed to fetch flag history:', err);
          setError('Failed to load flag history');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, authorId]);

  const getReasonLabel = (reasonChoice: string): string => {
    const metadata = USER_FLAG_REASON_METADATA[reasonChoice as UserFlagReasonKey];
    return metadata?.label || reasonChoice;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black !bg-opacity-25"
            onClick={(e) => e.stopPropagation()}
          />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div
            className="flex min-h-full items-center justify-center p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900 mb-4">
                    Flag History
                  </DialogTitle>

                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  )}

                  {error && <div className="text-sm text-red-600 py-4 text-center">{error}</div>}

                  {!isLoading && !error && flags.length === 0 && (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      No flag history found for this user.
                    </div>
                  )}

                  {!isLoading && !error && flags.length > 0 && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {flags.map((flag) => (
                        <div
                          key={flag.id}
                          className="border border-gray-200 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-gray-900">
                              {getReasonLabel(flag.reasonChoice)}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDistanceToNow(flag.createdDate, { addSuffix: true })}
                            </span>
                          </div>
                          {flag.reasonMemo && (
                            <p className="mt-1 text-gray-600 text-xs">{flag.reasonMemo}</p>
                          )}
                          <p className="mt-2 text-xs text-gray-400">
                            Flagged by {flag.createdBy.firstName} {flag.createdBy.lastName}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
