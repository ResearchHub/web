import { SearchDetailContent } from './components/SearchDetailContent';

interface SearchDetailPageProps {
  params: Promise<{ searchId: string }>;
}

export default async function SearchDetailPage({ params }: SearchDetailPageProps) {
  const { searchId } = await params;

  return <SearchDetailContent searchId={searchId} />;
}
