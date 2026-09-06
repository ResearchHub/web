import { stripHtml } from '@/utils/stringUtils';
import { FeedEntry } from './feed';

export interface AuthorPublicationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    recommendation_id: string | null;
    documents: {
      id: number;
      authors: Array<{
        id: number;
        first_name: string;
        last_name: string;
        user: number | null;
        authorship: {
          position: string;
          is_corresponding: boolean;
        };
      }>;
      title: string;
      paper_title: string;
      paper_publish_date: string;
      abstract: string | null;
      slug: string;
      work_type: string;
      external_source: string;
      citations: number;
      is_open_access: boolean;
      oa_status: string;
      created_date: string;
    };
    hubs: Array<{
      id: number;
      name: string;
      slug: string;
      hub_image: string;
    }>;
    created_date: string;
    document_type: string;
  }>;
}

export const transformPublicationToFeedEntry = (
  publication: AuthorPublicationsResponse['results'][0]
): FeedEntry => {
  const { documents, hubs, created_date } = publication;

  if (!documents) {
    throw new Error('Publication documents field is missing');
  }

  const authors = documents.authors || [];
  const firstAuthor = authors[0];

  return {
    id: documents.id?.toString() || '',
    recommendationId: publication.recommendation_id,
    timestamp: documents.paper_publish_date || created_date,
    action: 'publish',
    contentType: 'PAPER',
    content: {
      unifiedDocumentId: publication.id?.toString() || '',
      id: documents.id,
      contentType: 'PAPER',
      createdDate: created_date,
      textPreview: stripHtml(documents.abstract || ''),
      slug: documents.slug || '',
      title: documents.title || '',
      authors: authors.map((author) => ({
        id: author.id,
        profileImage: '',
        firstName: author.first_name || '',
        lastName: author.last_name || '',
        fullName: `${author.first_name || ''} ${author.last_name || ''}`.trim() || 'Unknown Author',
        profileUrl: '',
        isClaimed: false,
        isVerified: false,
      })),
      topics: (hubs || [])
        .map((hub: any) => ({
          id: hub.id,
          name: hub.name,
          hub_image: hub.hub_image,
          slug: hub.slug,
        }))
        .slice(0, 2),
      createdBy: {
        id: firstAuthor?.id || 0,
        profileImage: '',
        firstName: firstAuthor?.first_name || '',
        lastName: firstAuthor?.last_name || '',
        fullName:
          `${firstAuthor?.first_name || ''} ${firstAuthor?.last_name || ''}`.trim() ||
          'Unknown Author',
        profileUrl: '',
        isClaimed: false,
        isVerified: false,
      },
      journal: {
        id: 0,
        name: '',
        slug: '',
        description: '',
      },
    },
    relatedWork: undefined,
    metrics: undefined,
  };
};

export const transformAuthorPublicationsResponse = (
  response: AuthorPublicationsResponse
): {
  entries: FeedEntry[];
  next: string | null;
  previous: string | null;
  count: number;
} => {
  return {
    entries: response.results.map(transformPublicationToFeedEntry),
    next: response.next,
    previous: response.previous,
    count: response.count,
  };
};
