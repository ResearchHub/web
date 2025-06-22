import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  AuditService,
  AuditFilters,
  FlaggedContent,
  FlaggedContentListResponse,
} from '@/services/audit.service';
import { ID } from '@/types/root';

export type AuditStatus = 'pending' | 'dismissed' | 'removed';

interface UseAuditOptions {
  status?: AuditStatus;
  hubId?: ID;
  initialData?: FlaggedContentListResponse;
}

export const useAudit = (options: UseAuditOptions = {}) => {
  const [entries, setEntries] = useState<FlaggedContent[]>(options.initialData?.results || []);
  const [isLoading, setIsLoading] = useState(!options.initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<FlaggedContentListResponse | null>(
    options.initialData || null
  );
  const [error, setError] = useState<Error | null>(null);
  const [selectedIds, setSelectedIds] = useState<ID[]>([]);

  // Convert user-friendly status to API filter
  const getApiFilter = (status?: AuditStatus): AuditFilters => {
    const verdict =
      status === 'pending'
        ? 'OPEN'
        : status === 'dismissed'
          ? 'APPROVED'
          : status === 'removed'
            ? 'REMOVED'
            : 'OPEN';

    return {
      verdict,
      ...(options.hubId && { hubId: options.hubId }),
    };
  };

  // Load initial flagged content
  useEffect(() => {
    if (options.initialData) {
      return;
    }
    loadFlaggedContent();
  }, [options.status, options.hubId]);

  const loadFlaggedContent = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedIds([]);
    // Clear entries immediately to show loading skeleton instead of stale data
    setEntries([]);
    setCurrentResponse(null);

    try {
      const filters = getApiFilter(options.status);
      const response = await AuditService.fetchFlaggedContent(filters);
      setEntries(response.results);
      setCurrentResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load flagged content'));
      console.error('Error loading flagged content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!currentResponse?.next || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const filters = getApiFilter(options.status);
      const response = await AuditService.fetchFlaggedContent(filters, currentResponse.next);
      setEntries((prev) => [...prev, ...response.results]);
      setCurrentResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more flagged content'));
      console.error('Error loading more flagged content:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleItemSelect = useCallback((itemId: ID) => {
    setSelectedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const removeFlaggedContent = async (
    flagIds: ID[],
    verdictChoice?: string,
    sendEmail?: boolean
  ) => {
    try {
      // All flags should have associated content items based on API structure
      // But we'll still validate to be safe
      const validFlagIds = flagIds.filter((flagId) => {
        const flaggedItem = entries.find((item) => item.id === flagId);
        if (!flaggedItem?.item?.id) {
          console.warn(`Skipping flag ${flagId} - no associated content item or missing item.id`);
          return false;
        }
        return true;
      });

      if (validFlagIds.length === 0) {
        toast.error('No valid content items to remove');
        return false;
      }

      if (validFlagIds.length !== flagIds.length) {
        console.warn(
          `Warning: Skipping ${flagIds.length - validFlagIds.length} flags without valid content items`
        );
      }

      await AuditService.removeFlaggedContent({
        flagIds: validFlagIds,
        verdictChoice,
        sendEmail,
      });

      // Remove items from state
      setEntries((prev) => prev.filter((item) => !validFlagIds.includes(item.id)));

      // Clear selection if any of the removed items were selected
      setSelectedIds((prev) => prev.filter((id) => !validFlagIds.includes(id)));

      toast.success(`${validFlagIds.length} flagged content item(s) removed successfully`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove flagged content';
      toast.error(errorMessage);
      console.error('Error removing flagged content:', err);
      return false;
    }
  };

  const dismissFlaggedContent = async (flagIds: ID[], verdictChoice?: string) => {
    try {
      await AuditService.dismissFlaggedContent({ flagIds, verdictChoice });

      // Remove items from state
      setEntries((prev) => prev.filter((item) => !flagIds.includes(item.id)));

      // Clear selection if any of the dismissed items were selected
      setSelectedIds((prev) => prev.filter((id) => !flagIds.includes(id)));

      toast.success(`${flagIds.length} flag(s) dismissed successfully`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss flags';
      toast.error(errorMessage);
      console.error('Error dismissing flags:', err);
      return false;
    }
  };

  const removeFlaggedPaperPDF = async (flagIds: ID[], verdictChoice?: string) => {
    try {
      await AuditService.removeFlaggedPaperPDF({ flagIds, verdictChoice });

      // Remove items from state
      setEntries((prev) => prev.filter((item) => !flagIds.includes(item.id)));

      // Clear selection if any of the removed items were selected
      setSelectedIds((prev) => prev.filter((id) => !flagIds.includes(id)));

      toast.success(`${flagIds.length} paper PDF(s) removed successfully`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove paper PDF';
      toast.error(errorMessage);
      console.error('Error removing paper PDF:', err);
      return false;
    }
  };

  // Helper functions for single item actions (used by AuditItemCard)
  const handleSingleItemAction = async (
    flagId: ID,
    action: 'dismiss' | 'remove',
    options?: { verdictChoice?: string; sendEmail?: boolean }
  ) => {
    switch (action) {
      case 'dismiss':
        return await dismissFlaggedContent([flagId], options?.verdictChoice);
      case 'remove':
        return await removeFlaggedContent([flagId], options?.verdictChoice, options?.sendEmail);
      default:
        return false;
    }
  };

  // Bulk action helpers
  const handleBulkAction = async (
    action: 'dismiss' | 'remove' | 'removePdf',
    flagIds?: ID[],
    options?: { verdictChoice?: string; sendEmail?: boolean }
  ) => {
    const targetIds = flagIds || selectedIds;

    if (targetIds.length === 0) {
      toast.error('No items selected');
      return false;
    }

    switch (action) {
      case 'dismiss':
        return await dismissFlaggedContent(targetIds, options?.verdictChoice);
      case 'remove':
        return await removeFlaggedContent(targetIds, options?.verdictChoice, options?.sendEmail);
      case 'removePdf':
        return await removeFlaggedPaperPDF(targetIds, options?.verdictChoice);
      default:
        return false;
    }
  };

  return {
    // Data
    entries,
    selectedIds,

    // Loading states
    isLoading,
    isLoadingMore,
    error,

    // Pagination
    hasMore: !!currentResponse?.next,
    loadMore,

    // Actions
    refresh: loadFlaggedContent,
    handleItemSelect,
    clearSelection,

    // Individual actions
    removeFlaggedContent,
    dismissFlaggedContent,
    removeFlaggedPaperPDF,

    // Helper functions for single items and bulk operations
    handleSingleItemAction,
    handleBulkAction,
  };
};
