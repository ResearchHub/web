'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNonprofitSearch } from '@/hooks/useNonprofitSearch';
import { NonprofitOrg } from '@/types/nonprofit';
import { Input } from '@/components/ui/form/Input';
import { SectionHeader } from './SectionHeader';
import { Info, Search, ExternalLink, Building, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { createPortal } from 'react-dom';

export function NonprofitSearchSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInfoOrg, setSelectedInfoOrg] = useState<NonprofitOrg | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
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

      // Only close dropdown if the click is outside both the dropdown and any open popover
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !isClickInsidePopover
      ) {
        setIsDropdownOpen(false);
      }

      // Close info popover when clicking outside, but not when clicking the popover X button
      const isClickingX = (event.target as Element)?.closest('.nonprofit-popover-close');
      if (selectedInfoOrg && !isClickInsidePopover && !isClickingX) {
        setSelectedInfoOrg(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedInfoOrg]);

  const handleInfoClick = (nonprofit: NonprofitOrg, event: React.MouseEvent) => {
    event.stopPropagation();

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
    setSelectedInfoOrg(null);
  };

  // Clear the selected nonprofit
  const handleClearSelectedNonprofit = () => {
    setValue('selectedNonprofit', null);
    setValue('departmentLabName', '');
    setSearchTerm('');
  };

  return (
    <div className="py-3 px-6 space-y-3">
      <SectionHeader icon={Building}>Find a Nonprofit Organization</SectionHeader>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Input
            placeholder={selectedNonprofit ? selectedNonprofit.name : 'Search for a nonprofit...'}
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
                />
              ))
            )}
          </div>
        )}
      </div>

      {selectedNonprofit && (
        <>
          <div className="mt-4 p-3 border border-gray-200 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{selectedNonprofit.name}</h4>
                <p className="text-xs text-gray-500">EIN: {selectedNonprofit.ein}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedNonprofit.nteeDescription}</p>
              </div>
              <div className="flex items-center">
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 mr-1"
                  onClick={(e) => handleInfoClick(selectedNonprofit, e)}
                >
                  <Info className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
                  onClick={handleClearSelectedNonprofit}
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label
              htmlFor="departmentLabName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              University Department and Lab Name
            </label>
            <Input
              id="departmentLabName"
              placeholder="e.g., Weldon School of Biomedical Engineering, Rayz Lab"
              value={departmentLabName || ''}
              onChange={(e) => setValue('departmentLabName', e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              This information will be associated with the nonprofit organization for this
              preregistration.
            </p>
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
    </div>
  );
}

interface NonprofitSuggestionItemProps {
  nonprofit: NonprofitOrg;
  onSelect: (nonprofit: NonprofitOrg) => void;
  onInfoClick: (e: React.MouseEvent) => void;
}

function NonprofitSuggestionItem({
  nonprofit,
  onSelect,
  onInfoClick,
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
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
        onClick={onInfoClick}
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

          <div className="pt-3 border-t border-gray-100">
            <a
              href={nonprofit.endaomentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              View on Endaoment
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-4 transform translate-y-[8px] rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
    </div>
  );
}
