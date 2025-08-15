import { useState, useEffect, useCallback } from 'react';
import { EditorService } from '@/services/editor.service';
import type {
  EditorFilters,
  TransformedEditorData,
  ActiveContributorsData,
  EditorType,
} from '@/types/editor';

// Hook state types
export interface EditorsDashboardState {
  editors: TransformedEditorData[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type UseEditorsDashboardReturn = [
  EditorsDashboardState,
  {
    goToPage: (page: number) => Promise<void>;
    goToNextPage: () => Promise<void>;
    goToPrevPage: () => Promise<void>;
    refetch: (filters: EditorFilters) => Promise<void>;
    createEditor: (params: {
      editorEmail: string;
      editorType: EditorType;
      selectedHubId: number;
    }) => Promise<void>;
    deleteEditor: (params: { editorEmail: string; selectedHubId: number }) => Promise<void>;
  },
];

export function useEditorsDashboard(
  filters: EditorFilters,
  pageSize: number = 10
): UseEditorsDashboardReturn {
  const [editors, setEditors] = useState<TransformedEditorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchEditors = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await EditorService.fetchEditors(filters, { page, pageSize });

        setEditors(response.editors);
        setTotalCount(response.count);
        setCurrentPage(page);

        // Fetch active contributors if we have editors
        if (response.editors.length > 0) {
          const userIds = response.editors.map((editor) => editor.id).join(',');
          const contributors = await EditorService.fetchActiveContributors(filters, userIds);
          setEditors((prevEditors) =>
            prevEditors.map((editor) => ({
              ...editor,
              activeHubContributorCount: contributors.current_active_contributors[editor.id],
              previousActiveHubContributorCount:
                contributors.previous_active_contributors[editor.id],
            }))
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch editors';
        setError(errorMessage);
        console.error('Error fetching editors:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pageSize]
  );

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > totalPages) return;
      await fetchEditors(page);
    },
    [fetchEditors, totalPages]
  );

  const goToNextPage = useCallback(async () => {
    if (hasNextPage) {
      await fetchEditors(currentPage + 1);
    }
  }, [hasNextPage, currentPage, fetchEditors]);

  const goToPrevPage = useCallback(async () => {
    if (hasPrevPage) {
      await fetchEditors(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, fetchEditors]);

  const refetch = useCallback(
    async (newFilters: EditorFilters) => {
      setCurrentPage(1);
      await fetchEditors(1);
    },
    [fetchEditors]
  );

  const createEditor = useCallback(
    async (params: { editorEmail: string; editorType: EditorType; selectedHubId: number }) => {
      try {
        setError(null);
        await EditorService.createEditor(params);
        // Refetch the current page to show the new editor
        await fetchEditors(currentPage);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create editor';
        setError(errorMessage);
        console.error('Error creating editor:', err);
        throw err; // Re-throw to allow component to handle
      }
    },
    [fetchEditors, currentPage]
  );

  const deleteEditor = useCallback(
    async (params: { editorEmail: string; selectedHubId: number }) => {
      try {
        setError(null);
        await EditorService.deleteEditor(params);
        // Refetch the current page to reflect the deletion
        await fetchEditors(currentPage);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete editor';
        setError(errorMessage);
        console.error('Error deleting editor:', err);
        throw err; // Re-throw to allow component to handle
      }
    },
    [fetchEditors, currentPage]
  );

  // Initial load
  useEffect(() => {
    fetchEditors(1);
  }, [fetchEditors]);

  const state: EditorsDashboardState = {
    editors,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };

  return [
    state,
    {
      goToPage,
      goToNextPage,
      goToPrevPage,
      refetch,
      createEditor,
      deleteEditor,
    },
  ];
}
