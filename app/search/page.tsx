import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SearchPageContent } from './SearchPageContent';

export const metadata: Metadata = {
  title: 'Search | ResearchHub',
  description:
    'Search papers, grants, authors, and peer reviews on ResearchHub. Find the latest research with advanced filtering and sorting options.',
  keywords: 'search, research, papers, grants, authors, peer review, academic search',
  openGraph: {
    title: 'Search ResearchHub',
    description: 'Search papers, grants, authors, and peer reviews on ResearchHub.',
    type: 'website',
  },
};

interface SearchPageProps {
  readonly searchParams: Promise<{
    readonly q?: string;
    readonly tab?: string;
    readonly sort?: string;
    readonly page?: string;
    readonly debug?: string;
    readonly [key: string]: string | undefined;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Block access without debug flag (check if parameter exists, not its value)
  if (params.debug === undefined) {
    redirect('/');
  }

  return <SearchPageContent searchParams={params} />;
}
