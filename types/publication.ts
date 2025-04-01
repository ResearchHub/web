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
