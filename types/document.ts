import { AuthorProfile } from "./user";

export type WorkType = 
  | 'article'
  | 'review'
  | 'preprint'
  | 'preregistration'

export type AuthorPosition = 'first' | 'middle' | 'last';

export interface Authorship {
  authorProfile: AuthorProfile;
  isCorresponding: boolean;
  position: AuthorPosition;
}

// TODO: Createa a transformer function
export type DocumentVersion = {
  workId: number;
  version: string;
  isLatest: boolean;
  publishedDate: string;
  description: string;
};

// TODO: Create a base transformer that includes raw and other common fields
export interface Work {
  id: number;
  type: WorkType;
  title: string;
  slug: string;
  createdDate: string;
  publishedDate: string;
  authors: Authorship[];
  abstract?: string;
  doi?: string;
  // TODO: Break into own type
  journal?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  topics: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  formats: Array<{
    type: string;
    url: string;
  }>;
  license?: string;
  pdfCopyrightAllowsDisplay?: boolean;
  figures: Array<{
    url: string;
  }>;
  versions: Array<DocumentVersion>;

  // TODO: Refactor to ensure these metrics are shared with the feed
  // TODO: Break into own type
  metrics: {
    votes: number;
    comments: number;
    saves: number;
    reviewScore: number;
    reviews: number;
    earned: number;
  };
}

