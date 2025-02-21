'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileText, Upload } from 'lucide-react';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';
import { RadioGroup } from '@headlessui/react';
import clsx from 'clsx';

type Step = 'select' | 'metadata' | 'declarations' | 'preview';

export default function WorkCreatePage() {
  const router = useRouter();
  const [currentStep] = useState<Step>('select');

  const steps: { id: Step; name: string }[] = [
    { id: 'select', name: 'Select paper' },
    { id: 'metadata', name: 'Metadata' },
    { id: 'declarations', name: 'Declarations' },
    { id: 'preview', name: 'Preview' },
  ];

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.entityType === 'paper') {
      if (suggestion.id) {
        router.push(`/paper/submit/${suggestion.id}`);
      } else if (suggestion.doi) {
        router.push(`/paper/submit?doi=${encodeURIComponent(suggestion.doi)}`);
      }
    }
  };

  const submissionOptions = [
    {
      id: 'upload',
      title: 'Upload Manuscript',
      description: 'Upload a PDF version of your manuscript',
      icon: Upload,
      route: '/paper/preprint/upload',
    },
    {
      id: 'draft',
      title: 'Draft in Lab Notebook',
      description: 'Write and format your research directly in our editor',
      icon: FileText,
      route: '/notebook',
    },
  ];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="pb-12">
          <div className="">
            <PageHeader
              title="Submit your research"
              className="mb-0 relative z-10 justify-center"
            />
            <p className="mt-4 text-xl text-gray-600 mx-auto">
              Share your work with the ResearchHub community and make an impact in the scientific
              world
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex flex-col space-y-2">
            <div className="flex w-full gap-2">
              {steps.map((step, stepIdx) => {
                const isCurrentStep = currentStep === step.id;
                const isCompleted = steps.findIndex((s) => s.id === currentStep) > stepIdx;
                return (
                  <div key={step.name} className="flex-1">
                    <div
                      className={clsx(
                        'h-2 rounded-full',
                        isCompleted
                          ? 'bg-indigo-600'
                          : isCurrentStep
                            ? 'bg-indigo-600'
                            : 'bg-gray-200',
                        'transition-colors duration-300'
                      )}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex w-full gap-2">
              {steps.map((step, stepIdx) => {
                const isCurrentStep = currentStep === step.id;
                const isCompleted = steps.findIndex((s) => s.id === currentStep) > stepIdx;
                return (
                  <div
                    key={step.name}
                    className={clsx(
                      'text-sm font-medium flex-1',
                      isCompleted || isCurrentStep ? 'text-indigo-600' : 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Search for your preprint</h2>
            <p className="text-base text-gray-600 mb-4">
              Already published a preprint? Search for it here to speed up the process
            </p>
            <Search
              onSelect={handleSearchSelect}
              placeholder="Search by title or DOI"
              className="w-full"
              displayMode="inline"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-lg">
            <span className="px-6 text-gray-500 bg-white font-medium">OR</span>
          </div>
        </div>

        {/* Radio Group Options */}
        <RadioGroup className="mt-8">
          <RadioGroup.Label className="sr-only">Submission type</RadioGroup.Label>
          <div className="space-y-4">
            {submissionOptions.map((option) => (
              <RadioGroup.Option
                key={option.id}
                value={option}
                className={({ checked }) =>
                  clsx(
                    'relative flex cursor-pointer rounded-2xl p-6 focus:outline-none transform transition-all duration-200 hover:scale-[1.01] hover:shadow-lg w-full',
                    checked ? 'border-2 border-indigo-600' : 'border border-gray-200'
                  )
                }
                onClick={() => router.push(option.route)}
              >
                {({ checked }) => (
                  <div className="flex items-center w-full">
                    <div
                      className={clsx('p-3 rounded-lg', checked ? 'bg-indigo-100' : 'bg-gray-100')}
                    >
                      <option.icon
                        className={clsx('h-6 w-6', checked ? 'text-indigo-600' : 'text-gray-600')}
                      />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-medium text-gray-900">{option.title}</h3>
                      <p className="mt-1 text-base text-gray-600">{option.description}</p>
                    </div>
                  </div>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
    </PageLayout>
  );
}
