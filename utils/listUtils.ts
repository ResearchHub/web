import { UserList, UserListDetail, UserListItem } from '@/types/user-list';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';

export const getItemCount = (list: UserList | UserListDetail): number =>
  'items' in list && Array.isArray(list.items)
    ? list.items.length
    : (list.items_count ?? list.item_count ?? 0);

export const formatItemCount = (list: UserList | UserListDetail): string =>
  formatCount(getItemCount(list));

export const formatCount = (count: number): string => `${count} ${count === 1 ? 'item' : 'items'}`;

const getFirstAvailable = <T>(...values: (T | null | undefined)[]): T | '' =>
  (values.find((v) => v != null) as T) ?? '';

function mapDocumentTypeToContentType(docType?: string): string {
  if (!docType) return 'PAPER';
  const upper = docType.toUpperCase();
  if (upper === 'PUBLISHED' || upper === 'PAPER') return 'PAPER';
  const postTypes = [
    'PREREGISTRATION',
    'POST',
    'DISCUSSION',
    'GRANT',
    'QUESTION',
    'PROPOSAL',
    'FUND',
  ];
  return postTypes.includes(upper) ? 'RESEARCHHUBPOST' : 'PAPER';
}

const createFallbackEntry = (item: UserListItem, document: any): FeedEntry =>
  ({
    id: item.id.toString(),
    contentType: 'PAPER' as any,
    createdDate: item.created_date || '',
    timestamp: document.created_date || item.created_date || '',
    action: 'publish' as const,
    content: {
      id: document.id || item.unified_document || 0,
      contentType: 'PAPER',
      createdDate: item.created_date || '',
      title: document.title || 'Untitled',
      slug: document.slug || '',
      textPreview: document.renderable_text || document.abstract || '',
      authors: [],
      topics: [],
      journal: { id: 0, name: '', slug: '', image: null, description: '' },
      createdBy: {
        id: 0,
        fullName: 'Unknown',
        firstName: '',
        lastName: '',
        profileImage: '',
        headline: '',
        profileUrl: '/author/0',
        isClaimed: false,
        isVerified: false,
      },
      unifiedDocumentId: (
        item.unified_document || item.unified_document_data?.unified_document_id
      )?.toString(),
    },
    unifiedDocumentId: (
      item.unified_document || item.unified_document_data?.unified_document_id
    )?.toString(),
  }) as FeedEntry;

export function convertListItemsToFeedEntries(items: UserListItem[]): FeedEntry[] {
  if (!items?.length) return [];

  return items.map((item) => {
    const docData = item.unified_document_data || {};
    const document = (docData.documents?.[0] || {}) as any;
    const unifiedDoc = (docData as any).unified_document || {};
    const createdDate = getFirstAvailable(
      document.created_date,
      docData.created_date,
      item.created_date
    );

    const rawEntry: RawApiFeedEntry = {
      id: item.id,
      content_type: mapDocumentTypeToContentType(docData.document_type || item.contentType),
      content_object: {
        ...document,
        unified_document_id: item.unified_document || docData.unified_document_id,
        grant: (docData as any).grant || document.grant,
        fundraise: (docData as any).fundraise || document.fundraise,
        hub: docData.hubs?.[0] || document.hubs?.[0],
        type: document.type || docData.document_type,
      },
      created_date: getFirstAvailable(item.created_date, createdDate),
      action: 'publish',
      action_date: createdDate,
      author: getFirstAvailable(
        document.authors?.[0],
        docData.created_by?.author_profile,
        docData.created_by
      ),
      metrics:
        unifiedDoc.score !== undefined || unifiedDoc.reviews
          ? {
              votes: unifiedDoc.score || 0,
              comments: unifiedDoc.discussion_count || 0,
              replies: unifiedDoc.discussion_count || 0,
              review_metrics: unifiedDoc.reviews
                ? {
                    avg: unifiedDoc.reviews.avg || 0,
                    count: unifiedDoc.reviews.count || 0,
                  }
                : undefined,
            }
          : undefined,
    };

    try {
      return transformFeedEntry(rawEntry);
    } catch (error) {
      console.error('Error transforming list item:', error, item);
      return createFallbackEntry(item, document);
    }
  });
}
