import { ApiClient } from './client';
import type {
  EditorFilters,
  ActiveContributorsData,
  TransformedEditorsResult,
  EditorType,
} from '@/types/editor';
import { transformEditorsPaginated } from '@/types/editor';
import { Hub } from '@/types/hub';

// Service-specific error class
export class EditorServiceError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'EditorServiceError';
  }
}

export class EditorService {
  private static readonly MODERATORS_PATH = '/api/moderators';
  private static readonly HUB_PATH = '/api/hub';

  /**
   * Fetches editors by their contributions within a date range with pagination
   * @param filters - Filter options including hub, timeframe, and ordering
   * @param params - Pagination parameters
   * @returns Promise with editors data and pagination info
   * @throws {EditorServiceError} When fetch fails
   * @example
   * const editors = await EditorService.fetchEditors(filters, { page: 1, pageSize: 10 });
   */
  static async fetchEditors(
    filters: EditorFilters,
    params: {
      page: number;
      pageSize: number;
    }
  ): Promise<TransformedEditorsResult> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('page_size', params.pageSize.toString());
      if (filters.orderBy) {
        queryParams.append('order_by', filters.orderBy.value);
      }

      if (filters.selectedHub) {
        queryParams.append('hub_id', filters.selectedHub.id.toString());
      }

      if (filters.timeframe?.startDate) {
        queryParams.append('startDate', filters.timeframe.startDate.toISOString());
      }

      if (filters.timeframe?.endDate) {
        queryParams.append('endDate', filters.timeframe.endDate.toISOString());
      }

      const response = await ApiClient.get<any>(
        `${this.MODERATORS_PATH}/get_editors_by_contributions/?${queryParams.toString()}`
      );

      return transformEditorsPaginated(params.pageSize)(response);
    } catch (error) {
      console.error('Error fetching editors:', error);
      throw new EditorServiceError('Failed to fetch editors. Please try again.', error);
    }
  }

  /**
   * Fetches active contributors data for editors
   * @param filters - Filter options for timeframe
   * @param userIds - Comma-separated list of user IDs
   * @returns Promise with active contributors data
   * @throws {EditorServiceError} When fetch fails
   * @example
   * const contributors = await EditorService.fetchActiveContributors(filters, '1,2,3');
   */
  static async fetchActiveContributors(
    filters: EditorFilters,
    userIds: string
  ): Promise<ActiveContributorsData> {
    try {
      const params = new URLSearchParams({
        userIds,
        ...(filters.timeframe?.startDate && {
          startDate: filters.timeframe.startDate.toISOString(),
        }),
        ...(filters.timeframe?.endDate && { endDate: filters.timeframe.endDate.toISOString() }),
      });

      const response = await ApiClient.get<any>(
        `/api/get_hub_active_contributors/?${params.toString()}`
      );

      return response;
    } catch (error) {
      console.error('Error fetching active contributors:', error);
      throw new EditorServiceError('Failed to fetch active contributors. Please try again.', error);
    }
  }

  /**
   * Fetches available hubs for filtering
   * @returns Promise with list of hubs
   * @throws {EditorServiceError} When fetch fails
   * @example
   * const hubs = await EditorService.fetchHubs();
   */
  static async fetchHubs(): Promise<Hub[]> {
    try {
      const response = await ApiClient.get<any>(`${this.HUB_PATH}/`);
      return response.results;
    } catch (error) {
      console.error('Error fetching hubs:', error);
      throw new EditorServiceError('Failed to fetch hubs. Please try again.', error);
    }
  }

  /**
   * Creates a new editor for a hub
   * @param params - Parameters for creating an editor
   * @returns Promise with the created editor data
   * @throws {EditorServiceError} When creation fails
   * @example
   * const editor = await EditorService.createEditor({
   *   editorEmail: 'editor@example.com',
   *   editorType: EDITOR_TYPES.ASSISTANT_EDITOR,
   *   selectedHubId: 123
   * });
   */
  static async createEditor(params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubId: number;
  }): Promise<any> {
    try {
      const response = await ApiClient.post<any>(`${this.HUB_PATH}/create_new_editor/`, {
        editor_email: params.editorEmail,
        editor_type: params.editorType,
        selected_hub_id: params.selectedHubId,
      });

      return response;
    } catch (error) {
      console.error('Error creating editor:', error);
      throw new EditorServiceError('Failed to create editor. Please try again.', error);
    }
  }

  /**
   * Deletes an editor from a hub
   * @param params - Parameters for deleting an editor
   * @returns Promise with the deletion result
   * @throws {EditorServiceError} When deletion fails
   * @example
   * await EditorService.deleteEditor({
   *   editorEmail: 'editor@example.com',
   *   selectedHubId: 123
   * });
   */
  static async deleteEditor(params: { editorEmail: string; selectedHubId: number }): Promise<any> {
    try {
      const response = await ApiClient.post<any>(`${this.HUB_PATH}/delete_editor/`, {
        editor_email: params.editorEmail,
        selected_hub_id: params.selectedHubId,
      });

      return response;
    } catch (error) {
      console.error('Error deleting editor:', error);
      throw new EditorServiceError('Failed to delete editor. Please try again.', error);
    }
  }
}
