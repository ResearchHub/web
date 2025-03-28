import { createTransformer } from './transformer';

// Transformed types for our application
export interface OpenAlexAuthor {
  id: string;
  displayName: string;
  orcid?: string;
}

export interface OpenAlexWork {
  id: string;
  title: string;
  doi?: string;
  doiUrl?: string;
  publicationYear?: number;
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

export const transformOpenAlexWork = createTransformer<any, OpenAlexWork>((raw) => ({
  id: raw.id,
  title: raw.title,
  doi: raw.doi,
  doiUrl: raw.doi_url,
  publicationYear: raw.publication_year,
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
}));

export const transformPublicationsResponse = createTransformer<any, PublicationSearchResponse>(
  (raw) => ({
    works: (raw.works || []).map(transformOpenAlexWork),
    selectedAuthorId: raw.selected_author_id,
    availableAuthors: (raw.available_authors || []).map(transformOpenAlexAuthor),
  })
);
