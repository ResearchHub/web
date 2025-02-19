'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkSubmissionForm } from '@/components/work/WorkSubmissionForm';

type Step = 'content' | 'authors' | 'declarations' | 'preview';

export default function UploadPaperPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('content');

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.push('/paper/preprint')}
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
          <h2 className="text-2xl font-semibold text-gray-900">Upload your manuscript</h2>
          <p className="mt-4 text-xl text-gray-600">
            Share your research with the ResearchHub community
          </p>
        </div>

        <WorkSubmissionForm onStepChange={setCurrentStep} />
      </div>
    </PageLayout>
  );
}
