'use client';

import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNonprofitSelector } from '@/hooks/useNonprofitSelector';
import { NonprofitOrg } from '@/types/nonprofit';
import { ExternalLink } from 'lucide-react';

import { NonprofitHeader } from './NonprofitHeader';
import { NonprofitSearchBox } from './NonprofitSearchBox';
import NonprofitDisplay from './NonprofitDisplay';
import { Button } from '@/components/ui/Button';

export interface NonprofitSelectionResult {
  nonprofit: NonprofitOrg | null;
  note: string;
}

interface NonprofitSearchSectionProps {
  readOnly?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  initialNonprofit?: NonprofitOrg | null;
  initialNote?: string;
  onChange?: (result: NonprofitSelectionResult) => void;
  standalone?: boolean;
}

/**
 * A component for searching and selecting nonprofit organizations
 *
 * This component can be used in two ways:
 * 1. Within an existing form context - set standalone to false (default)
 * 2. As a standalone component with its own state - set standalone to true
 */
export function NonprofitSearchSection({
  readOnly = false,
  allowClear = false,
  onClear,
  initialNonprofit = null,
  initialNote = '',
  onChange,
  standalone = false,
}: NonprofitSearchSectionProps) {
  const methods = useForm({
    defaultValues: {
      selectedNonprofit: initialNonprofit,
      departmentLabName: initialNote,
    },
  });

  if (standalone) {
    return (
      <FormProvider {...methods}>
        <NonprofitSearchSectionInner
          readOnly={readOnly}
          allowClear={allowClear}
          onClear={onClear}
          onChange={onChange}
        />
      </FormProvider>
    );
  }

  return (
    <NonprofitSearchSectionInner
      readOnly={readOnly}
      allowClear={allowClear}
      onClear={onClear}
      onChange={onChange}
    />
  );
}

function NonprofitSearchSectionInner({
  readOnly = false,
  allowClear = false,
  onClear,
  onChange,
}: Omit<NonprofitSearchSectionProps, 'initialNonprofit' | 'initialNote' | 'standalone'>) {
  const { setValue, watch } = useFormContext();
  const selectedNonprofit = watch('selectedNonprofit');
  const departmentLabName = watch('departmentLabName');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [selectedInfoNonprofit, setSelectedInfoNonprofit] = useState<NonprofitOrg | null>(null);
  const [showEndaomentInfo, setShowEndaomentInfo] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    isDropdownOpen,
    setIsDropdownOpen,
    selectedNonprofit: hookSelectedNonprofit,
    note,
    setNote,
    handleSelectNonprofit,
    handleClearNonprofit,
    isFeatureEnabled,
  } = useNonprofitSelector({
    initialSelectedNonprofit: selectedNonprofit,
    initialNote: departmentLabName,
    readOnly,
    onSelectNonprofit: (nonprofit, note) => {
      setValue('selectedNonprofit', nonprofit, { shouldDirty: true });
      setValue('departmentLabName', note, { shouldDirty: true });

      // Close dropdown when a nonprofit is selected
      setIsDropdownOpen(false);

      if (onChange) {
        onChange({
          nonprofit,
          note,
        });
      }
    },
  });

  useEffect(() => {
    if (departmentLabName !== note) {
      setNote(departmentLabName || '');
    }
  }, [departmentLabName, note, setNote]);

  useEffect(() => {
    if (onChange) {
      onChange({
        nonprofit: selectedNonprofit,
        note: departmentLabName || '',
      });
    }
  }, [selectedNonprofit, departmentLabName, onChange]);

  // Handle Escape key to close dropdown
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleNonprofitInfoClick = (nonprofit: NonprofitOrg) => {
    setSelectedInfoNonprofit(nonprofit);
    setShowInfoDialog(true);
    // No longer closing the dropdown when viewing info
  };

  if (!isFeatureEnabled) {
    return null;
  }

  const handleClear = () => {
    handleClearNonprofit();
    setValue('selectedNonprofit', null, { shouldDirty: true });
    setValue('departmentLabName', '', { shouldDirty: true });

    if (onClear) {
      onClear();
    }

    if (onChange) {
      onChange({
        nonprofit: null,
        note: '',
      });
    }
  };

  return (
    <div className="space-y-3">
      <NonprofitHeader
        readOnly={readOnly}
        showEndaomentInfo={showEndaomentInfo}
        onInfoClick={() => setShowEndaomentInfo(true)}
      />

      {!readOnly && (
        <p className="text-xs text-gray-500 -mt-2 mb-2">
          Check if your university has a nonprofit foundation to facilitate your donations
        </p>
      )}

      {!selectedNonprofit && !readOnly && (
        <div ref={dropdownRef}>
          <NonprofitSearchBox
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            isLoading={isSearching}
            results={searchResults}
            onSelectNonprofit={handleSelectNonprofit}
            onInfoClick={handleNonprofitInfoClick}
            selectedInfoNonprofit={selectedInfoNonprofit}
            inputRef={searchInputRef}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}

      {selectedNonprofit && (
        <NonprofitDisplay
          nonprofit={selectedNonprofit}
          note={departmentLabName}
          onNoteChange={(value: string) =>
            setValue('departmentLabName', value, { shouldDirty: true })
          }
          onInfoClick={() => handleNonprofitInfoClick(selectedNonprofit)}
          onClear={handleClear}
          isInfoOpen={showInfoDialog && selectedInfoNonprofit?.id === selectedNonprofit.id}
          readOnly={readOnly}
          allowClear={allowClear}
        />
      )}

      {/* Nonprofit Info Dialog */}
      <Transition show={showInfoDialog && !!selectedInfoNonprofit} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowInfoDialog(false)}>
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
                  {selectedInfoNonprofit && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Dialog.Title className="text-lg font-medium text-gray-900 flex-1 mr-2">
                          {selectedInfoNonprofit.name}
                        </Dialog.Title>
                        <Button
                          onClick={() => setShowInfoDialog(false)}
                          className="text-gray-400 hover:text-gray-600"
                          variant="ghost"
                          size="icon"
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
                      {selectedInfoNonprofit.ein && (
                        <a
                          href={`https://app.endaoment.org/orgs/${selectedInfoNonprofit.ein.substring(0, 2)}-${selectedInfoNonprofit.ein.substring(2)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1 mb-2 block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Endaoment
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      )}

                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm pt-1">
                        {selectedInfoNonprofit.ein && (
                          <>
                            <span className="text-gray-500">EIN:</span>
                            <span className="font-medium">
                              {selectedInfoNonprofit.ein.substring(0, 2) +
                                '-' +
                                selectedInfoNonprofit.ein.substring(2)}
                            </span>
                          </>
                        )}

                        <span className="text-gray-500">Location:</span>
                        <span>
                          {selectedInfoNonprofit.address.region},{' '}
                          {selectedInfoNonprofit.address.country}
                        </span>

                        <span className="text-gray-500">Category:</span>
                        <span className="break-words">
                          {selectedInfoNonprofit.nteeCode} - {selectedInfoNonprofit.nteeDescription}
                        </span>

                        <span className="text-gray-500">Endaoment ID:</span>
                        <span className="font-medium break-words">
                          {selectedInfoNonprofit.endaomentOrgId}
                        </span>
                      </div>

                      {selectedInfoNonprofit.description && (
                        <div className="pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">
                            {selectedInfoNonprofit.description}
                          </p>
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
                        About nonprofit support
                      </Dialog.Title>
                      <Button
                        onClick={() => setShowEndaomentInfo(false)}
                        className="text-gray-400 hover:text-gray-600"
                        variant="ghost"
                        size="icon"
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
                        <span className="font-medium text-gray-800">Endaoment</span> is a nonprofit
                        community foundation that processes donations from users directly to
                        university nonprofits on behalf of researchers.
                      </p>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Benefits:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Researchers don't have to handle crypto or payments</li>
                          <li>Donors receive tax-deductible status for qualifying contributions</li>
                          <li>Seamless transfer of funds to university foundations</li>
                          <li>Support for multiple asset types (crypto, cash, etc.)</li>
                        </ul>
                      </div>

                      <p>
                        By selecting a nonprofit organization, you're enabling Endaoment to process
                        donations through their nonprofit support program, ensuring your research
                        receives funding while maintaining compliance with tax regulations.
                      </p>

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
    </div>
  );
}
