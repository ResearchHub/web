import { UserList, UserListDetail, UserListItem } from '@/types/user-list';
import { pluralizeSuffix } from './stringUtils';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';

export const getItemCount = (list: UserList | UserListDetail): number =>
  'items' in list && Array.isArray(list.items)
    ? list.items.length
    : (list.items_count ?? list.item_count ?? 0);

export const formatItemCount = (list: UserList): string => {
  const count = getItemCount(list);
  return `${count} item${pluralizeSuffix(count)}`;
};

export const updateListRemoveItem = (
  prev: UserListDetail | null,
  itemId: number
): UserListDetail | null =>
  prev
    ? {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
        item_count: Math.max(0, (prev.item_count || prev.items?.length || 0) - 1),
      }
    : null;

export function convertListItemsToFeedEntries(items: UserListItem[]): FeedEntry[] {
  if (!items?.length) return [];

  return items.map((item) => {
    const { document: doc } = item;
    const { content_object: content, author } = doc;

    const rawEntry: RawApiFeedEntry = {
      id: doc.id,
      content_type: doc.content_type,
      content_object: {
        ...content,
        unified_document_id: content.unified_document_id,
        grant: content.grant,
        fundraise: content.fundraise,
        hub: content.hub,
        type: content.type,
      },
      created_date: doc.created_date,
      action: doc.action || 'publish',
      action_date: doc.action_date,
      author: {
        ...author,
        headline: author.headline || undefined,
        profile_image: author.profile_image || '',
      },
      metrics: doc.metrics,
      recommendation_id: null,
    };

    try {
      return transformFeedEntry(rawEntry);
    } catch (error) {
      console.error('Failed to transform list item to feed entry:', error, item);
      return {
        id: item.id.toString(),
        contentType: doc.content_type as any,
        createdDate: doc.created_date,
        timestamp: doc.action_date,
        action: doc.action as any,
        recommendationId: null,
        content: {
          id: content.id,
          contentType: doc.content_type as any,
          createdDate: doc.created_date,
          title: content.title || 'Untitled',
          slug: content.slug || '',
          textPreview: content.renderable_text || '',
          authors: [],
          topics: content.hub
            ? [{ id: content.hub.id, name: content.hub.name, slug: content.hub.slug }]
            : [],
          journal: { id: 0, name: '', slug: '', image: null, description: '' },
          createdBy: {
            id: author.id,
            fullName: `${author.first_name} ${author.last_name}`,
            firstName: author.first_name,
            lastName: author.last_name,
            profileImage: author.profile_image || '',
            headline: author.headline || '',
            profileUrl: `/author/${author.id}`,
            isClaimed: false,
            isVerified: author.user?.is_verified || false,
          },
          unifiedDocumentId: content.unified_document_id?.toString(),
        },
        unifiedDocumentId: content.unified_document_id?.toString(),
      } as FeedEntry;
    }
  });
}
