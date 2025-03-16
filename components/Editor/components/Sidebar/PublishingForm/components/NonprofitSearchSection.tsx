'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNonprofitSearch } from '@/hooks/useNonprofitSearch';
import { NonprofitOrg } from '@/types/nonprofit';
import { Input } from '@/components/ui/form/Input';
import { SectionHeader } from './SectionHeader';
import { Info, Search, ExternalLink, Building, X, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/styles';
import { createPortal } from 'react-dom';

export function NonprofitSearchSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInfoOrg, setSelectedInfoOrg] = useState<NonprofitOrg | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [showEndaomentInfo, setShowEndaomentInfo] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const endaomentInfoButtonRef = useRef<HTMLButtonElement>(null);
  const { results, isLoading, searchNonprofits, clearResults } = useNonprofitSearch();
  const { setValue, watch } = useFormContext();
  const selectedNonprofit = watch('selectedNonprofit');
  const departmentLabName = watch('departmentLabName');

  // Perform search when searchTerm changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchNonprofits(searchTerm, { count: 15 });
        setIsDropdownOpen(true);
      } else {
        clearResults();
        setIsDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchNonprofits, clearResults]);

  // Handle selection of a nonprofit
  const handleSelectNonprofit = (nonprofit: NonprofitOrg) => {
    // Find the Base network wallet address (chainId: 8453)
    const baseDeployment = nonprofit.deployments.find((deployment) => deployment.chainId === 8453);
    const baseWalletAddress = baseDeployment?.address;

    // Store the nonprofit with the base wallet address in the form
    setValue('selectedNonprofit', {
      ...nonprofit,
      baseWalletAddress,
    });

    // Clear the search term and close the dropdown
    setSearchTerm('');
    setIsDropdownOpen(false);
    setSelectedInfoOrg(null);
  };

  // Handle click outside to close dropdown and popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if we're clicking inside a nonprofit-info-popover element
      const isClickInsidePopover = (event.target as Element)?.closest('.nonprofit-info-popover');
      // Don't close if we're clicking an info button
      const isClickingInfoButton = (event.target as Element)
        ?.closest('button')
        ?.querySelector('.lucide-info, .lucide-help-circle');

      // Only close dropdown if the click is outside both the dropdown and any open popover
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !isClickInsidePopover
      ) {
        setIsDropdownOpen(false);
      }

      // Close info popover when clicking outside, but not when clicking the popover X button or info buttons
      const isClickingX = (event.target as Element)?.closest('.nonprofit-popover-close');
      if (selectedInfoOrg && !isClickInsidePopover && !isClickingX && !isClickingInfoButton) {
        setSelectedInfoOrg(null);
      }

      // Close Endaoment info popover when clicking outside
      const isClickInsideEndaomentPopover = (event.target as Element)?.closest(
        '.endaoment-info-popover'
      );
      const isClickingEndaomentInfoButton = endaomentInfoButtonRef.current?.contains(
        event.target as Node
      );
      if (showEndaomentInfo && !isClickInsideEndaomentPopover && !isClickingEndaomentInfoButton) {
        setShowEndaomentInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedInfoOrg, showEndaomentInfo]);

  const handleInfoClick = (nonprofit: NonprofitOrg, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // Toggle behavior: if the same nonprofit is clicked, close the popover
    if (selectedInfoOrg && selectedInfoOrg.id === nonprofit.id) {
      setSelectedInfoOrg(null);
      return;
    }

    // Get the position of the clicked element
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // Position the popover above the info icon, but shifted more to the right
    setPopoverPosition({
      top: rect.top - 10, // Position above with a small gap
      left: rect.left - 295 + rect.width / 2, // Position more to the right (reduced the offset from 320 to 280)
    });

    setSelectedInfoOrg(nonprofit);
  };

  const handlePopoverClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedInfoOrg(null);
  };

  const handleEndaomentInfoToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (showEndaomentInfo) {
      setShowEndaomentInfo(false);
      return;
    }

    // Get the position of the clicked element
    const rect = endaomentInfoButtonRef.current?.getBoundingClientRect();

    if (rect) {
      setPopoverPosition({
        top: rect.bottom + 10, // Position below with a small gap
        left: rect.left - 295 + rect.width / 2,
      });
      setShowEndaomentInfo(true);
    }
  };

  // Clear the selected nonprofit
  const handleClearSelectedNonprofit = () => {
    setValue('selectedNonprofit', null);
    setValue('departmentLabName', '');
    setSearchTerm('');
  };

  return (
    <div className="py-3 px-6 space-y-3">
      <div className="mb-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Building className="h-4 w-4 text-gray-700" />
          <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">
            Find a Nonprofit
          </h3>
          <button
            ref={endaomentInfoButtonRef}
            className={cn(
              'p-1 rounded-full hover:bg-gray-100',
              showEndaomentInfo
                ? 'text-primary-600 bg-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            )}
            onClick={handleEndaomentInfoToggle}
            type="button"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2 mb-2">
        Check if your university has a nonprofit foundation to facilitate your donations
      </p>

      {!selectedNonprofit && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Input
              placeholder="Search for a nonprofit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              onFocus={() => {
                if (!searchTerm) {
                  setIsDropdownOpen(false);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {searchTerm ? (
                <X
                  className="h-4 w-4 cursor-pointer hover:text-gray-600"
                  onClick={() => {
                    setSearchTerm('');
                    setIsDropdownOpen(false);
                  }}
                />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
          </div>

          {isDropdownOpen && (results.length > 0 || isLoading) && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              {isLoading ? (
                <div className="p-3 text-sm text-gray-500">Searching...</div>
              ) : (
                results.map((nonprofit) => (
                  <NonprofitSuggestionItem
                    key={nonprofit.id}
                    nonprofit={nonprofit}
                    onSelect={handleSelectNonprofit}
                    onInfoClick={(e) => handleInfoClick(nonprofit, e)}
                    selectedInfoOrg={selectedInfoOrg}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {selectedNonprofit && (
        <>
          <div className="mt-2 p-2 border border-gray-100 rounded-md bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <h4 className="text-xs font-medium text-gray-800">{selectedNonprofit.name}</h4>
                <p className="text-xs text-gray-500">EIN: {selectedNonprofit.ein}</p>
              </div>
              <div className="flex items-center shrink-0">
                <button
                  className={cn(
                    'p-1 rounded-full hover:bg-gray-100 mr-1',
                    selectedInfoOrg && selectedInfoOrg.id === selectedNonprofit.id
                      ? 'text-primary-600 bg-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleInfoClick(selectedNonprofit, e);
                  }}
                  type="button"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  onClick={handleClearSelectedNonprofit}
                  title="Clear selection"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label
              htmlFor="departmentLabName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              University Department and Lab
            </label>
            <Input
              id="departmentLabName"
              placeholder="e.g., Weldon School of Biomedical Engineering, Rayz Lab"
              value={departmentLabName || ''}
              onChange={(e) => setValue('departmentLabName', e.target.value)}
              className="w-full"
            />
          </div>
        </>
      )}

      {selectedInfoOrg &&
        createPortal(
          <NonprofitInfoPopover
            nonprofit={selectedInfoOrg}
            position={popoverPosition}
            onClose={handlePopoverClose}
          />,
          document.body
        )}

      {showEndaomentInfo &&
        createPortal(
          <EndaomentInfoPopover
            position={popoverPosition}
            onClose={() => setShowEndaomentInfo(false)}
          />,
          document.body
        )}
    </div>
  );
}

interface NonprofitSuggestionItemProps {
  nonprofit: NonprofitOrg;
  onSelect: (nonprofit: NonprofitOrg) => void;
  onInfoClick: (e: React.MouseEvent) => void;
  selectedInfoOrg: NonprofitOrg | null;
}

function NonprofitSuggestionItem({
  nonprofit,
  onSelect,
  onInfoClick,
  selectedInfoOrg,
}: NonprofitSuggestionItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
      onClick={() => onSelect(nonprofit)}
    >
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-sm font-medium">{nonprofit.name}</span>
        </div>
        <div className="text-xs text-gray-500">EIN: {nonprofit.ein}</div>
      </div>
      <button
        className={cn(
          'p-1 rounded-full hover:bg-gray-50',
          selectedInfoOrg && selectedInfoOrg.id === nonprofit.id
            ? 'text-primary-600 bg-gray-50'
            : 'text-gray-400 hover:text-gray-600'
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onInfoClick(e);
        }}
      >
        <Info className="h-4 w-4" />
      </button>
    </div>
  );
}

interface NonprofitInfoPopoverProps {
  nonprofit: NonprofitOrg;
  position: { top: number; left: number };
  onClose: (e: React.MouseEvent) => void;
}

function NonprofitInfoPopover({ nonprofit, position, onClose }: NonprofitInfoPopoverProps) {
  // Find Base network deployment (chainId: 8453)
  const baseDeployment = nonprofit.deployments.find((deployment) => deployment.chainId === 8453);

  return (
    <div
      className="nonprofit-info-popover fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)', // Position above the element
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold text-gray-900">{nonprofit.name}</h3>
          <button
            className="nonprofit-popover-close text-gray-400 hover:text-gray-600 p-1"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <span className="text-gray-500">EIN:</span>
            <span className="font-medium">{nonprofit.ein}</span>

            <span className="text-gray-500">Location:</span>
            <span>
              {nonprofit.address.region}, {nonprofit.address.country}
            </span>

            <span className="text-gray-500">Category:</span>
            <span>
              {nonprofit.nteeCode} - {nonprofit.nteeDescription}
            </span>

            {baseDeployment && (
              <>
                <span className="text-gray-500">Base Address:</span>
                <a
                  href={`https://basescan.org/address/${baseDeployment.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {baseDeployment.address.slice(0, 8)}...{baseDeployment.address.slice(-6)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>

          {nonprofit.description && (
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                {nonprofit.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-4 transform translate-y-[8px] rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
    </div>
  );
}

interface EndaomentInfoPopoverProps {
  position: { top: number; left: number };
  onClose: () => void;
}

function EndaomentInfoPopover({ position, onClose }: EndaomentInfoPopoverProps) {
  return (
    <div
      className="endaoment-info-popover fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold text-gray-900">About Fiscal Sponsorship</h3>
          <button
            className="nonprofit-popover-close text-gray-400 hover:text-gray-600 p-1"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Endaoment</span> is a nonprofit community
            foundation that processes donations from users directly to university nonprofits on
            behalf of researchers.
          </p>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Benefits:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Researchers don't have to handle crypto or payments</li>
              <li>Donors receive tax-deductible status for their contributions</li>
              <li>Seamless transfer of funds to university foundations</li>
              <li>Support for multiple asset types (crypto, cash, etc.)</li>
            </ul>
          </div>

          <p>
            By selecting a nonprofit organization, you're enabling Endaoment to process donations
            through their fiscal sponsorship program, ensuring your research receives funding while
            maintaining compliance with tax regulations.
          </p>

          <div className="pt-2">
            <a
              href="https://endaoment.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline flex items-center gap-1"
            >
              Learn more about Endaoment
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-4 transform translate-y-[-8px] rotate-45 w-4 h-4 bg-white border-l border-t border-gray-200"></div>
    </div>
  );
}
