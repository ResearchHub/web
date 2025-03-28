'use client';

import { Input } from '@/components/ui/form/Input';
import { Search, X, Info } from 'lucide-react';
import { NonprofitOrg } from '@/types/nonprofit';
import { cn } from '@/utils/styles';
import { KeyboardEvent, RefObject } from 'react';
import { Button } from '@/components/ui/Button';

interface NonprofitSearchBoxProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  results: NonprofitOrg[];
  onSelectNonprofit: (nonprofit: NonprofitOrg) => void;
  onInfoClick: (nonprofit: NonprofitOrg, e: React.MouseEvent<HTMLButtonElement>) => void;
  selectedInfoNonprofit: NonprofitOrg | null;
  inputRef?: RefObject<HTMLInputElement>;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function NonprofitSearchBox({
  searchTerm,
  onSearchChange,
  isDropdownOpen,
  setIsDropdownOpen,
  isLoading,
  results,
  onSelectNonprofit,
  onInfoClick,
  selectedInfoNonprofit,
  inputRef,
  onKeyDown,
}: NonprofitSearchBoxProps) {
  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search for a nonprofit..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={onKeyDown}
          ref={inputRef}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {searchTerm ? (
            <X
              className="h-4 w-4 cursor-pointer hover:text-gray-600"
              onClick={() => onSearchChange('')}
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
              <NonprofitResultItem
                key={nonprofit.id}
                nonprofit={nonprofit}
                onSelect={onSelectNonprofit}
                onInfoClick={(e) => onInfoClick(nonprofit, e)}
                selectedInfoNonprofit={selectedInfoNonprofit}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NonprofitResultItem({
  nonprofit,
  onSelect,
  onInfoClick,
  selectedInfoNonprofit,
}: {
  nonprofit: NonprofitOrg;
  onSelect: (nonprofit: NonprofitOrg) => void;
  onInfoClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  selectedInfoNonprofit: NonprofitOrg | null;
}) {
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
      <Button
        className={cn(
          selectedInfoNonprofit && selectedInfoNonprofit.id === nonprofit.id
            ? 'text-primary-600 bg-gray-50'
            : 'text-gray-400 hover:text-gray-600'
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onInfoClick(e);
        }}
        variant="ghost"
        size="icon"
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
  );
}
