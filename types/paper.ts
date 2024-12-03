import { Hub, User, Metrics } from './feed';

export type PaperContributor = {
  user: User;
  amount: number;
  affiliation: string;
};

export type PaperAuthor = {
  fullName: string;
};

export type Paper = {
  id: string;
  title: string;
  abstract: string;
  
  // Authors and metadata
  authors: PaperAuthor[];
  contributors: PaperContributor[];
  journal: string;
  isUnclaimed: boolean;
  publishDate: string;
  doi: string;
  license: string;
  hub: Hub;
  keywords: string[];
  pdfUrl: string;
  metrics: Metrics & {
    citations: number;
    totalReviews: number;
  };
}; 