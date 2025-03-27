'use client';

import { useRef, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { FeatureFlags } from '@/utils/featureFlags';
import { useNonprofitSelector } from '@/hooks/useNonprofitSelector';
import { NonprofitOrg } from '@/types/nonprofit';

// Import components directly from local files to avoid circular dependencies
import { NonprofitHeader } from './NonprofitHeader';
import { NonprofitSearchBox } from './NonprofitSearchBox';
import NonprofitDisplay from './NonprofitDisplay';
import { NonprofitInfoPopover } from './NonprofitInfoPopover';
import { EndaomentInfoPopover } from './EndaomentInfoPopover';

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
  standalone?: boolean; // If true, will use its own form context
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
  // If standalone, we need to create our own form context
  const methods = useForm({
    defaultValues: {
      selectedNonprofit: initialNonprofit,
      departmentLabName: initialNote,
    },
  });

  // For standalone mode, wrap the inner component with a FormProvider
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

  // Otherwise, use the existing form context
  return (
    <NonprofitSearchSectionInner
      readOnly={readOnly}
      allowClear={allowClear}
      onClear={onClear}
      onChange={onChange}
    />
  );
}

// Internal component that uses form context
function NonprofitSearchSectionInner({
  readOnly = false,
  allowClear = false,
  onClear,
  onChange,
}: Omit<NonprofitSearchSectionProps, 'initialNonprofit' | 'initialNote' | 'standalone'>) {
  // Hook into form context to get/set values
  const { setValue, watch } = useFormContext();
  const selectedNonprofit = watch('selectedNonprofit');
  const departmentLabName = watch('departmentLabName');

  // DOM refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const endaomentInfoButtonRef = useRef<HTMLButtonElement>(null);

  // Use our orchestration hook for state management
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
    infoNonprofit,
    infoPosition,
    showEndaomentInfo,
    handleSelectNonprofit,
    handleClearNonprofit,
    handleShowInfo,
    handleCloseInfo,
    toggleEndaomentInfo,
    isFeatureEnabled,
  } = useNonprofitSelector({
    initialSelectedNonprofit: selectedNonprofit,
    initialNote: departmentLabName,
    readOnly,
    onSelectNonprofit: (nonprofit, note) => {
      setValue('selectedNonprofit', nonprofit, { shouldDirty: true });
      setValue('departmentLabName', note, { shouldDirty: true });

      if (onChange) {
        onChange({
          nonprofit,
          note,
        });
      }
    },
  });

  // Update note state when it changes
  useEffect(() => {
    if (departmentLabName !== note) {
      setNote(departmentLabName || '');
    }
  }, [departmentLabName, note, setNote]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        nonprofit: selectedNonprofit,
        note: departmentLabName || '',
      });
    }
  }, [selectedNonprofit, departmentLabName, onChange]);

  // Handle click outside to close dropdown and popovers
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
      if (infoNonprofit && !isClickInsidePopover && !isClickingX && !isClickingInfoButton) {
        handleCloseInfo();
      }

      // Close Endaoment info popover when clicking outside
      const isClickInsideEndaomentPopover = (event.target as Element)?.closest(
        '.endaoment-info-popover'
      );
      const isClickingEndaomentInfoButton = endaomentInfoButtonRef.current?.contains(
        event.target as Node
      );
      if (showEndaomentInfo && !isClickInsideEndaomentPopover && !isClickingEndaomentInfoButton) {
        toggleEndaomentInfo({ top: 0, left: 0 });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [infoNonprofit, showEndaomentInfo, setIsDropdownOpen, handleCloseInfo, toggleEndaomentInfo]);

  // Get position for endaoment info button
  const handleEndaomentInfoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    // Get the position of the clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Position the popover above the info icon, similar to nonprofit info
    toggleEndaomentInfo({
      top: rect.top - 10, // Position above with a small gap
      left: rect.left - 327 + rect.width / 2, // Position more to the right, adjusted for wider popover
    });
  };

  // Handle nonprofit info click with positioning
  const handleNonprofitInfoClick = (
    nonprofit: NonprofitOrg,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();

    // Get the position of the clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Position the popover above the info icon, but shifted more to the right
    const position = {
      top: rect.top - 10, // Position above with a small gap
      left: rect.left - 295 + rect.width / 2, // Position more to the right
    };

    handleShowInfo(nonprofit, position);
  };

  // Early return if the feature is not enabled
  if (!isFeatureEnabled) {
    return null;
  }

  // Handle clear with callback for parent component
  const handleClear = () => {
    handleClearNonprofit();
    setValue('selectedNonprofit', null, { shouldDirty: true });
    setValue('departmentLabName', '', { shouldDirty: true });

    // Call onClear if provided
    if (onClear) {
      onClear();
    }

    // Notify parent of change
    if (onChange) {
      onChange({
        nonprofit: null,
        note: '',
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header section */}
      <NonprofitHeader
        readOnly={readOnly}
        showEndaomentInfo={showEndaomentInfo}
        onInfoClick={handleEndaomentInfoClick}
      />

      {!readOnly && (
        <p className="text-xs text-gray-500 -mt-2 mb-2">
          Check if your university has a nonprofit foundation to facilitate your donations
        </p>
      )}

      {/* Search box - show only if no nonprofit is selected and not in read-only mode */}
      {!selectedNonprofit && !readOnly && (
        <div ref={dropdownRef}>
          <NonprofitSearchBox
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isDropdownOpen={isDropdownOpen}
            isLoading={isSearching}
            results={searchResults}
            onSelectNonprofit={handleSelectNonprofit}
            onInfoClick={handleNonprofitInfoClick}
            selectedInfoNonprofit={infoNonprofit}
          />
        </div>
      )}

      {/* Selected nonprofit display */}
      {selectedNonprofit && (
        <NonprofitDisplay
          nonprofit={selectedNonprofit}
          note={departmentLabName}
          onNoteChange={(value: string) =>
            setValue('departmentLabName', value, { shouldDirty: true })
          }
          onInfoClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleNonprofitInfoClick(selectedNonprofit, e)
          }
          onClear={handleClear}
          isInfoOpen={infoNonprofit?.id === selectedNonprofit.id}
          readOnly={readOnly}
          allowClear={allowClear}
        />
      )}

      {/* Info popover for nonprofit details */}
      {infoNonprofit &&
        createPortal(
          <NonprofitInfoPopover
            nonprofit={infoNonprofit}
            position={infoPosition}
            onClose={handleCloseInfo}
          />,
          document.body
        )}

      {/* Info popover for Endaoment */}
      {showEndaomentInfo &&
        createPortal(
          <EndaomentInfoPopover
            position={infoPosition}
            onClose={() => toggleEndaomentInfo({ top: 0, left: 0 })}
          />,
          document.body
        )}
    </div>
  );
}
