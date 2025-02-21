'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';

type Step = 'select' | 'metadata' | 'declarations' | 'preview';

// Sample pre-populated data - will be replaced with dynamic data later
const SAMPLE_PAPER_DATA = {
  title: 'The Effects of Climate Change on Marine Ecosystems',
  abstract:
    'This study examines the long-term effects of climate change on marine ecosystems in the Pacific Ocean. Through a comprehensive analysis of temperature data, species population dynamics, and ecosystem health indicators collected over the past decade, we demonstrate significant shifts in marine biodiversity and ecosystem stability.',
  topics: 'Climate Change, Marine Biology, Ecosystem Dynamics',
  authors: ['John Smith', 'Sarah Johnson', 'Michael Chen'],
  doi: '10.1234/sample.123456',
  journal: 'Journal of Marine Science',
  year: '2023',
};

export default function PaperSubmitPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentStep] = useState<Step>('metadata');

  const steps: { id: Step; name: string }[] = [
    { id: 'select', name: 'Select paper' },
    { id: 'metadata', name: 'Metadata' },
    { id: 'declarations', name: 'Declarations' },
    { id: 'preview', name: 'Preview' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/paper/submit/${params.id}/declarations`);
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4">
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
                      'text-sm font-medium flex-1 text-center',
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

        <div className="pb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Paper Details</h2>
          <p className="mt-4 text-gray-600">Review and update the paper information below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <Input
                id="title"
                label="Title"
                defaultValue={SAMPLE_PAPER_DATA.title}
                placeholder="Enter the title of your paper"
                className="mt-1"
                inputSize="lg"
                labelClassName="font-semibold text-sm"
              />
            </div>

            <div>
              <Textarea
                id="abstract"
                label="Abstract"
                defaultValue={SAMPLE_PAPER_DATA.abstract}
                placeholder="Enter the abstract of your paper"
                className="mt-1 text-base px-4 py-3 min-h-[150px]"
                rows={6}
                labelClassName="font-semibold text-sm"
              />
            </div>

            <div>
              <Input
                id="topics"
                label="Topics"
                defaultValue={SAMPLE_PAPER_DATA.topics}
                placeholder="Enter topics (comma separated)"
                className="mt-1"
                inputSize="lg"
                labelClassName="font-semibold text-sm"
              />
            </div>

            <div>
              <Input
                id="authors"
                label="Authors"
                defaultValue={SAMPLE_PAPER_DATA.authors.join(', ')}
                placeholder="Enter authors (comma separated)"
                className="mt-1"
                inputSize="lg"
                labelClassName="font-semibold text-sm"
              />
            </div>

            <div>
              <Input
                id="doi"
                label="DOI"
                defaultValue={SAMPLE_PAPER_DATA.doi}
                placeholder="Enter DOI"
                className="mt-1"
                inputSize="lg"
                labelClassName="font-semibold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="journal"
                  label="Journal"
                  defaultValue={SAMPLE_PAPER_DATA.journal}
                  placeholder="Enter journal name"
                  className="mt-1"
                  inputSize="lg"
                  labelClassName="font-semibold text-sm"
                />
              </div>
              <div>
                <Input
                  id="year"
                  label="Year"
                  defaultValue={SAMPLE_PAPER_DATA.year}
                  placeholder="Enter publication year"
                  className="mt-1"
                  inputSize="lg"
                  labelClassName="font-semibold text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-lg font-medium flex items-center gap-2"
            >
              Next Step
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
