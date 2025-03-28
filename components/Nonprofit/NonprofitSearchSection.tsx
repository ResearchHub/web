'use client';

import { useRef, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { FeatureFlags } from '@/utils/featureFlags';
import { useNonprofitSelector } from '@/hooks/useNonprofitSelector';
import { NonprofitOrg } from '@/types/nonprofit';

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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const endaomentInfoButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsidePopover = (event.target as Element)?.closest('.nonprofit-info-popover');
      const isClickingInfoButton = (event.target as Element)
        ?.closest('button')
        ?.querySelector('.lucide-info, .lucide-help-circle');

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !isClickInsidePopover
      ) {
        setIsDropdownOpen(false);
      }

      const isClickingX = (event.target as Element)?.closest('.nonprofit-popover-close');
      if (infoNonprofit && !isClickInsidePopover && !isClickingX && !isClickingInfoButton) {
        handleCloseInfo();
      }

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

  const handleEndaomentInfoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left = rect.left - 327 + rect.width / 2;
    const arrowPosition = rect.left - left + rect.width / 2;
    const adjustedArrowPosition = Math.min(Math.max(arrowPosition, 40), 384 - 40);

    toggleEndaomentInfo({
      top: rect.top - 10,
      left: left,
      arrowPosition: adjustedArrowPosition,
    });
  };

  const handleNonprofitInfoClick = (
    nonprofit: NonprofitOrg,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = {
      top: rect.top - 10,
      left: rect.left - 295 + rect.width / 2,
    };

    handleShowInfo(nonprofit, position);
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
        onInfoClick={handleEndaomentInfoClick}
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
            isLoading={isSearching}
            results={searchResults}
            onSelectNonprofit={handleSelectNonprofit}
            onInfoClick={handleNonprofitInfoClick}
            selectedInfoNonprofit={infoNonprofit}
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
          onInfoClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleNonprofitInfoClick(selectedNonprofit, e)
          }
          onClear={handleClear}
          isInfoOpen={infoNonprofit?.id === selectedNonprofit.id}
          readOnly={readOnly}
          allowClear={allowClear}
        />
      )}

      {infoNonprofit &&
        createPortal(
          <NonprofitInfoPopover
            nonprofit={infoNonprofit}
            position={infoPosition}
            onClose={handleCloseInfo}
          />,
          document.body
        )}

      {showEndaomentInfo &&
        createPortal(
          <EndaomentInfoPopover
            position={infoPosition}
            onClose={() => toggleEndaomentInfo({ top: 0, left: 0, arrowPosition: 0 })}
            useAlternateText={false}
          />,
          document.body
        )}
    </div>
  );
}
