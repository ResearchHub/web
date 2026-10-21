import { Suspense } from 'react';
import { EmailsPageContent } from './components/EmailsPageContent';

export default function ExpertFinderEmailsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      }
    >
      <EmailsPageContent />
    </Suspense>
  );
}
