'use client';

import { Building, HelpCircle } from 'lucide-react';
import { NonprofitDisplay } from '@/components/Nonprofit';
import { NonprofitSkeleton } from '@/components/skeletons/NonprofitSkeleton';
import { ID } from '@/types/root';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { NonprofitOrg } from '@/types/nonprofit';
import { Button } from '@/components/ui/Button';

interface NonprofitSectionProps {
  fundraiseId: ID;
  className?: string;
}

/**
 * Component to display nonprofit information associated with a fundraise
 */
export function NonprofitSection({ fundraiseId, className }: NonprofitSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedNonprofit, setSelectedNonprofit] = useState<NonprofitOrg | null>(null);
  const [showEndaomentInfo, setShowEndaomentInfo] = useState(false);

  const { nonprofit, departmentLabName, isLoading, fetchNonprofitData } =
    useNonprofitByFundraiseId();

  useEffect(() => {
    fetchNonprofitData(fundraiseId);
    setIsMounted(true);
  }, [fundraiseId, fetchNonprofitData]);

  if (!nonprofit && !isLoading && isMounted) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-center space-x-2 mb-4">
        <Building className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Associated Nonprofit</h2>
        <Button
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setShowEndaomentInfo(true)}
          variant="ghost"
          size="icon"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      {isLoading || !isMounted ? (
        <NonprofitSkeleton showHeader={false} />
      ) : (
        nonprofit && (
          <div className="mt-2">
            <NonprofitDisplay
              nonprofit={nonprofit}
              note={departmentLabName || ''}
              onNoteChange={() => {}}
              onInfoClick={() => setSelectedNonprofit(nonprofit)}
              onClear={() => {}}
              isInfoOpen={selectedNonprofit?.id === nonprofit.id}
              readOnly={true}
              allowClear={false}
            />
          </div>
        )
      )}

      {/* Nonprofit Info Dialog */}
      <Transition show={!!selectedNonprofit} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedNonprofit(null)}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  {selectedNonprofit && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {selectedNonprofit.name}
                        </Dialog.Title>
                        <Button
                          onClick={() => setSelectedNonprofit(null)}
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                      </div>

                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                        <span className="text-gray-500">EIN:</span>
                        <span className="font-medium">{selectedNonprofit.ein}</span>

                        <span className="text-gray-500">Location:</span>
                        <span>
                          {selectedNonprofit.address.region}, {selectedNonprofit.address.country}
                        </span>

                        <span className="text-gray-500">Category:</span>
                        <span className="break-words">
                          {selectedNonprofit.nteeCode} - {selectedNonprofit.nteeDescription}
                        </span>

                        <span className="text-gray-500">Endaoment ID:</span>
                        <span className="font-medium break-words">
                          {selectedNonprofit.endaomentOrgId}
                        </span>
                      </div>

                      {selectedNonprofit.description && (
                        <div className="pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">{selectedNonprofit.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Endaoment Info Dialog */}
      <Transition show={showEndaomentInfo} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowEndaomentInfo(false)}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Tax-Deductible Donations
                      </Dialog.Title>
                      <Button
                        onClick={() => setShowEndaomentInfo(false)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 space-y-4">
                      <p>
                        <span className="font-medium text-gray-800">Tax-Deductible Donations</span>{' '}
                        are processed through this nonprofit foundation, making contributions over
                        $1,000 eligible for tax deductions while supporting the researcher's work.
                      </p>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Benefits:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Contributions over $1,000 are generally tax-deductible</li>
                          <li>Endaoment handles all payment processing</li>
                          <li>Support for multiple asset types including crypto and cash</li>
                        </ul>
                      </div>

                      <div className="pt-2">
                        <a
                          href="https://endaoment.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline flex items-center gap-1"
                        >
                          Learn more about Endaoment
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 3h6v6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 14L21 3"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}
