'use client';

import { useState, useEffect, useCallback } from 'react';
import { NonprofitOrg } from '@/types/nonprofit';
import { useNonprofitSearch } from './useNonprofitSearch';
import { FeatureFlags } from '@/utils/featureFlags';

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
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: NonprofitOrg[];
  isSearching: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;

  // Selected nonprofit state
  selectedNonprofit: NonprofitOrg | null;
  note: string;
  setNote: (note: string) => void;

  // Info popover state
  infoNonprofit: NonprofitOrg | null;
  infoPosition: { top: number; left: number; arrowPosition?: number };
  showEndaomentInfo: boolean;

  // Actions
  handleSelectNonprofit: (nonprofit: NonprofitOrg) => void;
  handleClearNonprofit: () => void;
  handleShowInfo: (nonprofit: NonprofitOrg, position: { top: number; left: number }) => void;
  handleCloseInfo: () => void;
  toggleEndaomentInfo: (position: { top: number; left: number; arrowPosition?: number }) => void;

  // Feature status
  isFeatureEnabled: boolean;
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
  // Feature flag check
  const isFeatureEnabled = FeatureFlags.nonprofitIntegration();

  // State
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

  /**
   * Debounced search
   */
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

  /**
   * Handle selection of a nonprofit
   */
  const handleSelectNonprofit = useCallback(
    (nonprofit: NonprofitOrg) => {
      // Find the Base network wallet address (chainId: 8453)
      const baseDeployment = nonprofit.deployments.find(
        (deployment) => deployment.chainId === 8453
      );
      const baseWalletAddress = baseDeployment?.address;

      // Make sure we always have an endaoment_org_id
      const endaoment_org_id = nonprofit.endaoment_org_id || nonprofit.id;

      // Create the enhanced nonprofit object
      const enhancedNonprofit = {
        ...nonprofit,
        baseWalletAddress,
        endaoment_org_id,
      };

      // Set state
      setSelectedNonprofit(enhancedNonprofit);
      setSearchTerm('');
      setIsDropdownOpen(false);
      setInfoNonprofit(null);

      // Notify parent if callback provided
      if (onSelectNonprofit) {
        onSelectNonprofit(enhancedNonprofit, note);
      }
    },
    [onSelectNonprofit, note]
  );

  /**
   * Clear the selected nonprofit
   *
   * Resets selection state and notifies parent component
   */
  const handleClearNonprofit = useCallback(() => {
    setSelectedNonprofit(null);
    setSearchTerm('');

    // Notify parent if callback provided
    if (onSelectNonprofit) {
      onSelectNonprofit(null, '');
    }
  }, [onSelectNonprofit]);

  /**
   * Show info popover for a nonprofit (toggle behavior)
   */
  const handleShowInfo = useCallback(
    (nonprofit: NonprofitOrg, position: { top: number; left: number }) => {
      // Toggle behavior: if the same nonprofit is clicked, close the popover
      if (infoNonprofit && infoNonprofit.id === nonprofit.id) {
        setInfoNonprofit(null);
        return;
      }

      setInfoPosition(position);
      setInfoNonprofit(nonprofit);
    },
    [infoNonprofit]
  );

  /**
   * Close the nonprofit info popover
   */
  const handleCloseInfo = useCallback(() => {
    setInfoNonprofit(null);
  }, []);

  /**
   * Toggle the Endaoment info popover
   */
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

    isFeatureEnabled,
  };
};
