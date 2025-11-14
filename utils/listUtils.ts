import { UserList, UserListDetail, UserListItem } from '@/types/user-list';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';

export const getItemCount = (list: UserList | UserListDetail): number =>
  'items' in list && Array.isArray(list.items)
    ? list.items.length
    : (list.items_count ?? list.item_count ?? 0);

export const formatItemCount = (list: UserList | UserListDetail): string => {
  const count = getItemCount(list);
  return `${count} ${count === 1 ? 'item' : 'items'}`;
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

const firstAvailable = <T>(...values: (T | null | undefined)[]): T | '' =>
  (values.find((v) => v != null) as T) ?? '';

const mapDocumentType = (docType?: string): string => {
  if (!docType) return 'PAPER';
  const type = docType.toUpperCase();
  if (type === 'PUBLISHED' || type === 'PAPER') return 'PAPER';
  const postTypes = [
    'PREREGISTRATION',
    'POST',
    'DISCUSSION',
    'GRANT',
    'QUESTION',
    'PROPOSAL',
    'FUND',
  ];
  return postTypes.includes(type) ? 'RESEARCHHUBPOST' : 'PAPER';
};

const getUnifiedDocAndId = (item: UserListItem) => {
  const unifiedDoc =
    typeof item.unified_document === 'object' ? (item.unified_document as any) : null;
  const unifiedDocId =
    unifiedDoc?.id ||
    (typeof item.unified_document === 'number' ? item.unified_document : null) ||
    item.unified_document_data?.unified_document_id ||
    null;
  return { unifiedDoc, unifiedDocId };
};

const createFallbackEntry = (item: UserListItem, document: any): FeedEntry => {
  const { unifiedDocId } = getUnifiedDocAndId(item);

  return {
    id: item.id.toString(),
    contentType: 'PAPER',
    createdDate: item.created_date || '',
    timestamp: document.created_date || item.created_date || '',
    action: 'publish',
    content: {
      id: document.id || unifiedDocId || 0,
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
      unifiedDocumentId: unifiedDocId?.toString(),
    },
    unifiedDocumentId: unifiedDocId?.toString(),
  } as FeedEntry;
};

const extractUnifiedDocData = (item: UserListItem) => {
  const { unifiedDoc, unifiedDocId } = getUnifiedDocAndId(item);
  const docData = (item.unified_document_data || {}) as any;

  const document = unifiedDoc?.content_object || docData.documents?.[0] || {};

  const contentType = unifiedDoc?.content_type
    ? unifiedDoc.content_type
    : unifiedDoc?.document_type
      ? mapDocumentType(unifiedDoc.document_type)
      : mapDocumentType(docData.document_type || item.contentType);

  const createdDate = firstAvailable(
    unifiedDoc?.action_date,
    unifiedDoc?.created_date,
    document.created_date,
    docData.created_date,
    item.created_date
  );

  const author =
    unifiedDoc?.author ||
    firstAvailable(
      document.author,
      document.authors?.[0],
      docData.created_by?.author_profile,
      docData.created_by
    );

  const metrics = unifiedDoc?.metrics
    ? {
        votes: unifiedDoc.metrics.votes ?? 0,
        comments: unifiedDoc.metrics.comments ?? 0,
        replies: unifiedDoc.metrics.replies ?? 0,
        review_metrics: unifiedDoc.metrics.review_metrics,
      }
    : docData.score !== undefined || docData.reviews
      ? {
          votes: docData.score || 0,
          comments: docData.discussion_count || 0,
          replies: docData.discussion_count || 0,
          review_metrics: docData.reviews
            ? { avg: docData.reviews.avg || 0, count: docData.reviews.count || 0 }
            : undefined,
        }
      : undefined;

  return { unifiedDoc, docData, unifiedDocId, document, contentType, createdDate, author, metrics };
};

export function convertListItemsToFeedEntries(items: UserListItem[]): FeedEntry[] {
  if (!items?.length) return [];

  return items.map((item) => {
    const {
      unifiedDoc,
      docData,
      unifiedDocId,
      document,
      contentType,
      createdDate,
      author,
      metrics,
    } = extractUnifiedDocData(item);

    const rawEntry: RawApiFeedEntry = {
      id: item.id,
      content_type: contentType,
      content_object: {
        ...document,
        unified_document_id: unifiedDocId != null ? Number(unifiedDocId) : undefined,
        grant: document.grant || docData.grant,
        fundraise: document.fundraise || docData.fundraise,
        hub: document.hub || docData.hubs?.[0],
        type:
          document.type ||
          document.document_type ||
          unifiedDoc?.document_type ||
          docData.document_type,
      },
      created_date: firstAvailable(item.created_date, createdDate),
      action: unifiedDoc?.action || 'publish',
      action_date: unifiedDoc?.action_date || createdDate,
      author,
      metrics,
    };

    try {
      return transformFeedEntry(rawEntry);
    } catch (error) {
      console.error('Error transforming list item:', error, item);
      return createFallbackEntry(item, document);
    }
  });
}
