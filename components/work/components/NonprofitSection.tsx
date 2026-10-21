'use client';

import { HelpCircle, Landmark } from 'lucide-react';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { ID } from '@/types/root';
import { useNonprofitOrg } from '@/hooks/useNonprofitByFundraiseId';
import { useWorkInstitution, useWorkNonprofit } from '@/components/work/WorkInstitutionContext';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';
import { formatNonprofitAddress } from '@/components/Nonprofit/formatNonprofitAddress';

interface NonprofitSectionProps {
  fundraiseId: ID;
  className?: string;
}

/** An EIN as it is written: 12-3456789. */
const formatEin = (ein: string) => `${ein.substring(0, 2)}-${ein.substring(2)}`;

/**
 * The nonprofit a fundraise pays into, as a sidebar card, or nothing for most
 * fundraises, which have none. It reads the nonprofit the proposal page loaded
 * (WorkInstitutionProvider), so it shows with the page; the details dialog
 * fills in from Endaoment after. Laid out as a row of the Reviewed by card:
 * a round icon, the name linking to its page on Endaoment, what the money is
 * designated for and the EIN, then a link to the details, as the other cards
 * end on theirs.
 */
export function NonprofitSection({ fundraiseId, className }: NonprofitSectionProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showEndaomentInfo, setShowEndaomentInfo] = useState(false);

  const link = useWorkNonprofit(fundraiseId);
  const nonprofit = useNonprofitOrg(link?.nonprofitDetails ?? null);
  const departmentLabName = link?.note;
  const href = useWorkInstitution()?.href;

  if (!nonprofit) {
    return null;
  }

  return (
    <SidebarCard
      title="Nonprofit recipient"
      action={
        <button
          type="button"
          onClick={() => setShowEndaomentInfo(true)}
          aria-label="How donations through a nonprofit work"
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      }
      className={className}
    >
      <div className="mt-2 flex gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          aria-hidden="true"
        >
          <Landmark className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1 text-[13px] leading-[18px]">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-900 hover:underline"
            >
              {nonprofit.name}
            </a>
          ) : (
            <p className="font-semibold text-gray-900">{nonprofit.name}</p>
          )}
          {departmentLabName && (
            <p className="mt-0.5 text-gray-600">Designated for {departmentLabName}</p>
          )}
          {nonprofit.ein && (
            <p className="mt-0.5 text-xs text-gray-500">EIN {formatEin(nonprofit.ein)}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsInfoOpen(true)}
        className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        About this nonprofit
      </button>

      {/* Nonprofit Info Dialog */}
      <Transition show={isInfoOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsInfoOpen(false)}>
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
                  {nonprofit && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {nonprofit.name}
                        </Dialog.Title>
                        <Button
                          onClick={() => setIsInfoOpen(false)}
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
                        {nonprofit.ein && (
                          <>
                            <span className="text-gray-500">EIN:</span>
                            <span className="font-medium">{formatEin(nonprofit.ein)}</span>
                          </>
                        )}

                        {formatNonprofitAddress(nonprofit.address) && (
                          <>
                            <span className="text-gray-500">Location:</span>
                            <span>{formatNonprofitAddress(nonprofit.address)}</span>
                          </>
                        )}

                        <span className="text-gray-500">Category:</span>
                        <span className="break-words">
                          {nonprofit.nteeCode} - {nonprofit.nteeDescription}
                        </span>

                        <span className="text-gray-500">Endaoment ID:</span>
                        <span className="font-medium break-words">{nonprofit.endaomentOrgId}</span>
                      </div>

                      {nonprofit.description && (
                        <div className="pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">{nonprofit.description}</p>
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
                        Supporting Research Institutions
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
                        Donations to this project are tax-deductible and will be processed as a
                        grant to the nonprofit organization listed. Donors who contribute $500 or
                        more will automatically receive a tax receipt from our grant-making partner,
                        Endaoment, upon the successful completion of this fundraiser.
                      </p>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Benefits:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Grants are sent directly to the researcher's account or lab</li>
                          <li>Endaoment handles all processing and conversion of RSC</li>
                          <li>Donors receive tax relief for their contribution to science</li>
                        </ul>
                      </div>

                      <div className="pt-2">
                        <a
                          href="https://app.endaoment.org/researchhub"
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
    </SidebarCard>
  );
}
