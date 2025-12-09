import { stripHtml } from '@/utils/stringUtils';
import { FeedEntry } from './feed';
import { createTransformer } from './transformer';

// Transformed types for our application
export interface OpenAlexAuthor {
  id: string;
  displayName: string;
  orcid?: string;
}

export interface OpenAlexConcept {
  displayName: string;
  level: number;
  relevancyScore: number;
}

export interface OpenAlexWork {
  id: string;
  title: string;
  doi?: string;
  doiUrl?: string;
  publicationYear?: number;
  publicationDate?: string;
  authorshipPosition?: string;
  venue?: {
    displayName?: string;
  };
  authorships?: Array<{
    author: {
      id: string;
      displayName: string;
    };
    position?: string;
  }>;
  concepts: OpenAlexConcept[];
}

export interface PublicationSearchResponse {
  works: OpenAlexWork[];
  selectedAuthorId: string | null;
  availableAuthors: OpenAlexAuthor[];
}

// Create transformers using the utility function
export const transformOpenAlexAuthor = createTransformer<any, OpenAlexAuthor>((raw) => ({
  id: raw.id,
  displayName: raw.display_name,
  orcid: raw.orcid,
}));

export const transformOpenAlexConcept = createTransformer<any, OpenAlexConcept>((raw) => ({
  displayName: raw.display_name,
  level: raw.level,
  relevancyScore: raw.score,
}));

export const transformOpenAlexWork = createTransformer<any, OpenAlexWork>((raw) => ({
  id: raw.id,
  title: raw.title,
  doiUrl: raw.doi,
  doi: raw.doi ? raw.doi.replace('https://doi.org/', '') : undefined,
  publicationYear: raw.publication_year,
  publicationDate: raw.publication_date,
  authorshipPosition: raw.authorship_position,
  venue: raw.venue
    ? {
        displayName: raw.venue.display_name,
      }
    : undefined,
  authorships: raw.authorships?.map((authorship: any) => ({
    author: {
      id: authorship.author.id,
      displayName: authorship.author.display_name,
    },
    position: authorship.position,
  })),
  concepts: (raw.concepts || []).map(transformOpenAlexConcept),
}));

export const transformPublicationsResponse = createTransformer<any, PublicationSearchResponse>(
  (raw) => ({
    works: (raw.works || []).map(transformOpenAlexWork),
    selectedAuthorId: raw.selected_author_id,
    availableAuthors: (raw.available_authors || []).map(transformOpenAlexAuthor),
  })
);

export interface TransformedPublication {
  id: string;
  title: string;
  doi?: string;
  doiUrl?: string;
  publicationYear?: number;
  publicationDate?: string;
  venue?: {
    displayName?: string;
  };
  authors: Array<{
    id: string;
    displayName: string;
    position?: string;
  }>;
  concepts: OpenAlexConcept[];
}

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

  return {
    id: documents.id.toString(),
    recommendationId: publication.recommendation_id,
    timestamp: created_date,
    action: 'publish',
    contentType: 'PAPER',
    content: {
      unifiedDocumentId: publication.id,
      id: documents.id,
      contentType: 'PAPER',
      createdDate: created_date,
      textPreview: stripHtml(documents.abstract || ''),
      slug: documents.slug,
      title: documents.title,
      authors: documents.authors.map((author) => ({
        id: author.id,
        profileImage: '',
        firstName: author.first_name,
        lastName: author.last_name,
        fullName: `${author.first_name} ${author.last_name}`,
        profileUrl: '',
        isClaimed: false,
        isVerified: false,
      })),
      topics: (
        hubs.map((hub: any) => ({
          id: hub.id,
          name: hub.name,
          hub_image: hub.hub_image,
          slug: hub.slug,
        })) || []
      ).slice(0, 2),
      createdBy: {
        id: documents.authors[0]?.id || 0,
        profileImage: '',
        firstName: documents.authors[0]?.first_name || '',
        lastName: documents.authors[0]?.last_name || '',
        fullName:
          `${documents.authors[0]?.first_name || ''} ${documents.authors[0]?.last_name || ''}`.trim(),
        profileUrl: '',
        isClaimed: false,
        isVerified: false,
      },
      journal: {
        id: 0,
        name: '', // TODO do we need this and what is this? DOI? do not think that we have it in the response.. documents.external_source,
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
