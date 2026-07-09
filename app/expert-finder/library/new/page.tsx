import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ExpertFinderForm } from './components/ExpertFinderForm';

interface FindExpertPageProps {
  searchParams: Promise<{ unifiedDocumentId?: string }>;
}

export default async function FindExpertPage({ searchParams }: FindExpertPageProps) {
  const params = await searchParams;
  // Arriving with `unifiedDocumentId` means the user clicked "Find experts" from a
  // work page, which auto-starts the search immediately, so the intermediate
  // "New search" navigation context isn't relevant here.
  const isAutoStarting = Boolean(params.unifiedDocumentId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {!isAutoStarting && (
        <Breadcrumbs
          items={[{ label: 'Library', href: '/expert-finder/library' }, { label: 'New search' }]}
          className="mb-2"
        />
      )}
      <ExpertFinderForm />
    </div>
  );
}
