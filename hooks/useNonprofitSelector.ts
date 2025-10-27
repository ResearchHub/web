'use client';

import { useState, useEffect, useCallback } from 'react';
import { NonprofitOrg } from '@/types/nonprofit';
import { useNonprofitSearch } from './useNonprofitSearch';
import { CHAIN_IDS } from '@/constants/chains';

/**
 * Props for initializing the useNonprofitSelector hook
 *
 * @property readOnly - Whether the selector is in read-only mode
 * @property initialSelectedNonprofit - Initial nonprofit selection, if any
 * @property initialNote - Initial note or department/lab name for the selected nonprofit
 * @property onSelectNonprofit - Callback when a nonprofit is selected or cleared
 */
export interface UseNonprofitSelectorProps {
  readOnly?: boolean;
  initialSelectedNonprofit?: NonprofitOrg | null;
  initialNote?: string;
  onSelectNonprofit?: (nonprofit: NonprofitOrg | null, note: string) => void;
}

/**
 * Return type for the useNonprofitSelector hook
 */
export interface UseNonprofitSelectorReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: NonprofitOrg[];
  isSearching: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;

  selectedNonprofit: NonprofitOrg | null;
  note: string;
  setNote: (note: string) => void;

  infoNonprofit: NonprofitOrg | null;
  infoPosition: { top: number; left: number; arrowPosition?: number };
  showEndaomentInfo: boolean;

  handleSelectNonprofit: (nonprofit: NonprofitOrg) => void;
  handleClearNonprofit: () => void;
  handleShowInfo: (nonprofit: NonprofitOrg, position: { top: number; left: number }) => void;
  handleCloseInfo: () => void;
  toggleEndaomentInfo: (position: { top: number; left: number; arrowPosition?: number }) => void;
}

/**
 * Hook for managing nonprofit selection UI and state
 *
 * This orchestration hook handles search, selection, and info popovers for nonprofit selection UI.
 *
 * @param props - Configuration options for the hook
 * @returns Object containing all state and functions needed for nonprofit selection UI
 */
export const useNonprofitSelector = ({
  readOnly = false,
  initialSelectedNonprofit = null,
  initialNote = '',
  onSelectNonprofit,
}: UseNonprofitSelectorProps = {}): UseNonprofitSelectorReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { results, isLoading, searchNonprofits, clearResults } = useNonprofitSearch();
  const [selectedNonprofit, setSelectedNonprofit] = useState<NonprofitOrg | null>(
    initialSelectedNonprofit
  );
  const [note, setNote] = useState(initialNote);
  const [infoNonprofit, setInfoNonprofit] = useState<NonprofitOrg | null>(null);
  const [infoPosition, setInfoPosition] = useState({ top: 0, left: 0 });
  const [showEndaomentInfo, setShowEndaomentInfo] = useState(false);

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

  const handleSelectNonprofit = useCallback(
    (nonprofit: NonprofitOrg) => {
      const baseDeployment = nonprofit.deployments.find(
        (deployment) => deployment.chainId === CHAIN_IDS.BASE
      );
      const baseWalletAddress = baseDeployment?.address;
      const endaomentOrgId = nonprofit.endaomentOrgId;

      const enhancedNonprofit = {
        ...nonprofit,
        baseWalletAddress,
        endaomentOrgId,
      };

      setSelectedNonprofit(enhancedNonprofit);
      setSearchTerm('');
      setIsDropdownOpen(false);
      setInfoNonprofit(null);

      if (onSelectNonprofit) {
        onSelectNonprofit(enhancedNonprofit, note);
      }
    },
    [onSelectNonprofit, note]
  );

  const handleClearNonprofit = useCallback(() => {
    setSelectedNonprofit(null);
    setSearchTerm('');

    if (onSelectNonprofit) {
      onSelectNonprofit(null, '');
    }
  }, [onSelectNonprofit]);

  const handleShowInfo = useCallback(
    (nonprofit: NonprofitOrg, position: { top: number; left: number }) => {
      if (infoNonprofit && infoNonprofit.id === nonprofit.id) {
        setInfoNonprofit(null);
        return;
      }

      setInfoPosition(position);
      setInfoNonprofit(nonprofit);
    },
    [infoNonprofit]
  );

  const handleCloseInfo = useCallback(() => {
    setInfoNonprofit(null);
  }, []);

  const toggleEndaomentInfo = useCallback(
    (position: { top: number; left: number; arrowPosition?: number }) => {
      if (showEndaomentInfo) {
        setShowEndaomentInfo(false);
        return;
      }

      setInfoPosition(position);
      setShowEndaomentInfo(true);
    },
    [showEndaomentInfo]
  );

  return {
    searchTerm,
    setSearchTerm,
    searchResults: results,
    isSearching: isLoading,
    isDropdownOpen,
    setIsDropdownOpen,

    selectedNonprofit,
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
  };
};
