'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { JournalRightSidebar } from '@/components/journal/JournalRightSidebar';
import { WorkSubmissionForm } from '@/components/work/WorkSubmissionForm';

export default function JournalSubmitPage() {
  const router = useRouter();

  return (
    <PageLayout rightSidebar={<JournalRightSidebar />}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => router.push('/paper/new')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 gap-1 text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="pb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Submit to ResearchHub Journal</h1>
          <p className="mt-4 text-xl text-gray-600">
            Get your research peer reviewed and published in our accredited journal
          </p>
        </div>

        <WorkSubmissionForm />
      </div>
    </PageLayout>
  );
}
