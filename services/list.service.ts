import { ApiClient } from './client';
import {
  UserList,
  UserListDetail,
  CreateListRequest,
  UpdateListRequest,
  AddItemRequest,
  ListStats,
  UserListItem,
  TopAuthor,
  TopHub,
  TopTopic,
  TopCategory,
} from '@/types/user-list';

interface ListApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface UserListsResponse {
  lists: UserList[];
  stats?: ListStats;
}

export class ListService {
  private static readonly BASE_PATH = '/api/user_list';
  private static readonly ITEM_BASE_PATH = '/api/user_list_item';

  /**
   * Fetch all lists for the current user
   */
  static async getUserLists(): Promise<UserListsResponse> {
    const response = await ApiClient.get<ListApiResponse<UserList>>(`${this.BASE_PATH}/`);
    return {
      lists: response.results || [],
      stats: this.aggregateStats(response.results || []),
    };
  }

  /**
   * Aggregate stats from all lists
   */
  private static aggregateStats(lists: UserList[]): ListStats | undefined {
    if (lists.length === 0) return undefined;

    try {
      // Aggregate authors
      const authorMap = new Map<number, { author: TopAuthor; totalCount: number }>();
      lists.forEach((list) => {
        list.top_authors?.forEach((author) => {
          if (author?.id && author?.full_name) {
            const existing = authorMap.get(author.id);
            if (existing) {
              existing.totalCount += author.count || 0;
            } else {
              authorMap.set(author.id, { author, totalCount: author.count || 0 });
            }
          }
        });
      });

      // Aggregate hubs (these are categories/topics)
      const hubMap = new Map<number, { hub: TopHub; count: number }>();
      lists.forEach((list) => {
        list.top_hubs?.forEach((hub) => {
          if (hub?.id && hub?.name) {
            const existing = hubMap.get(hub.id);
            if (existing) {
              existing.count += 1;
            } else {
              hubMap.set(hub.id, { hub, count: 1 });
            }
          }
        });
      });

      // Aggregate topics - handle cases where top_topics might have different structure
      const topicMap = new Map<number, { topic: any; count: number }>();
      lists.forEach((list) => {
        if (Array.isArray(list.top_topics)) {
          list.top_topics.forEach((topic: any) => {
            if (topic?.id && topic?.name) {
              const existing = topicMap.get(topic.id);
              if (existing) {
                existing.count += 1;
              } else {
                topicMap.set(topic.id, { topic, count: 1 });
              }
            }
          });
        }
      });

      // Sort and take top 5
      const topAuthors = Array.from(authorMap.values())
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 5)
        .map((item) => item.author);

      const topCategories = Array.from(hubMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item) => ({
          id: item.hub.id,
          name: item.hub.name,
          itemCount: item.count,
        }));

      const topTopics = Array.from(topicMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item) => ({
          id: item.topic.id,
          name: item.topic.name || item.topic.label || 'Unknown',
          itemCount: item.count,
        }));

      return {
        topAuthors,
        topCategories,
        topTopics,
      };
    } catch (error) {
      console.error('Error aggregating list stats:', error);
      // Return empty stats instead of failing completely
      return {
        topAuthors: [],
        topCategories: [],
        topTopics: [],
      };
    }
  }

  /**
   * Fetch a specific list by ID
   */
  static async getListById(listId: number): Promise<UserListDetail> {
    return await ApiClient.get<UserListDetail>(`${this.BASE_PATH}/${listId}/`);
  }

  /**
   * Create a new list
   */
  static async createList(data: CreateListRequest): Promise<UserList> {
    return await ApiClient.post<UserList>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Update a list name
   */
  static async updateList(listId: number, data: UpdateListRequest): Promise<UserList> {
    return await ApiClient.patch<UserList>(`${this.BASE_PATH}/${listId}/`, data);
  }

  /**
   * Delete a list
   */
  static async deleteList(listId: number): Promise<void> {
    await ApiClient.delete(`${this.BASE_PATH}/${listId}/`);
  }

  /**
   * Add an item to a list
   */
  static async addItemToList(listId: number, unifiedDocumentId: number): Promise<UserListItem> {
    return await ApiClient.post<UserListItem>(`${this.ITEM_BASE_PATH}/`, {
      parent_list: listId,
      unified_document: unifiedDocumentId,
    });
  }

  /**
   * Remove an item from a list
   */
  static async removeItemFromList(listId: number, itemId: number): Promise<void> {
    await ApiClient.delete(`${this.ITEM_BASE_PATH}/${itemId}/`);
  }
}
