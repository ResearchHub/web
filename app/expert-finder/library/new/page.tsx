import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ExpertFinderForm } from './components/ExpertFinderForm';

export default function FindExpertPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Library', href: '/expert-finder/library' }, { label: 'New search' }]}
        className="mb-2"
      />
      <ExpertFinderForm />
    </div>
  );
}
