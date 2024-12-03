import { Hub, User, Metrics } from './feed';

export type Applicant = {
  user: User;
};

export type Grant = {
  id: string;
  type: 'grant';
  title: string;
  abstract: string;
  details: string;
  
  // User information
  createdBy: User;
  authors: User[];
  
  // Metadata
  publishDate: string;
  deadline: string;
  hub: Hub;
  doi: string;
  keywords: string[];
  
  // Grant specific
  amount: string;
  amountUSD: string;
  status: string;
  
  // Metrics grouped together
  metrics: Metrics;
  
  // Applicants as User types
  applicants: Applicant[];
}; 