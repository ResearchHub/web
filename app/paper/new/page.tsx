'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileText, Upload, X, ArrowRight } from 'lucide-react';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion, WorkSuggestion } from '@/types/search';
import { RadioGroup } from '@headlessui/react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { ProgressStepper, Step } from '@/components/ui/ProgressStepper';

export default function WorkCreatePage() {
  const router = useRouter();
  const [currentStep] = useState<Step>('select');
  const [selectedPaper, setSelectedPaper] = useState<WorkSuggestion | null>(null);

  const steps: { id: Step; name: string }[] = [
    { id: 'select', name: 'Paper' },
    { id: 'metadata', name: 'Metadata' },
    { id: 'declarations', name: 'Declarations' },
    { id: 'preview', name: 'Preview' },
  ];

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.entityType === 'paper') {
      setSelectedPaper(suggestion as WorkSuggestion);
    }
  };

  const handleContinue = () => {
    if (selectedPaper) {
      if (selectedPaper.id) {
        router.push(`/paper/submit/${selectedPaper.id}`);
      } else if (selectedPaper.doi) {
        router.push(`/paper/submit?doi=${encodeURIComponent(selectedPaper.doi)}`);
      }
    }
  };

  const clearSelection = () => {
    setSelectedPaper(null);
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
          <ProgressStepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Search for your preprint</h2>
            <p className="text-base text-gray-600 mb-4">
              Already published a preprint? Search for it here to speed up the process
            </p>

            {!selectedPaper ? (
              <Search
                onSelect={handleSearchSelect}
                placeholder="Search by title or DOI"
                className="w-full"
                displayMode="inline"
              />
            ) : (
              <div className="flex flex-col md:flex-row md:items-stretch gap-4">
                <div className="flex-grow p-4 border border-indigo-200 bg-indigo-50 rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center h-full w-full">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-medium text-gray-900 truncate">
                        Selected paper: {selectedPaper.displayName || selectedPaper.doi}
                      </p>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="ml-2 flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Clear selection"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleContinue}
                  className="flex-shrink-0 h-auto flex items-center gap-2 whitespace-nowrap"
                  variant="default"
                  size="lg"
                >
                  Continue <ArrowRight size={18} />
                </Button>
              </div>
            )}
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
