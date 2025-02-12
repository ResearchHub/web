'use client';

import { useRouter } from 'next/navigation';
import { Search } from '@/components/Search/Search';
import { Button } from '@/components/ui/Button';
import { BookOpen, TrendingUp, Coins, MessageSquare } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { SearchSuggestion } from '@/types/search';

const RightSidebar = () => (
  <div className="space-y-8">
    {/* Feature Cards */}
    <div className="grid gap-4">
      <div className="bg-blue-50 rounded-xl p-6">
        <BookOpen className="w-6 h-6 text-blue-500 mb-3" />
        <h3 className="font-medium text-gray-900 mb-1">Open Access</h3>
        <p className="text-sm text-gray-600">Open access immediately, with a permanent DOI.</p>
      </div>
      <div className="bg-purple-50 rounded-xl p-6">
        <TrendingUp className="w-6 h-6 text-purple-500 mb-3" />
        <h3 className="font-medium text-gray-900 mb-1">Maximize Impact</h3>
        <p className="text-sm text-gray-600">Get more eyes on your research.</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-6">
        <Coins className="w-6 h-6 text-yellow-500 mb-3" />
        <h3 className="font-medium text-gray-900 mb-1">Earn RSC</h3>
        <p className="text-sm text-gray-600">Earn ResearchCoin when cited.</p>
      </div>
      <div className="bg-green-50 rounded-xl p-6">
        <MessageSquare className="w-6 h-6 text-green-500 mb-3" />
        <h3 className="font-medium text-gray-900 mb-1">Get Feedback</h3>
        <p className="text-sm text-gray-600">Receive feedback from the community.</p>
      </div>
    </div>

    {/* Process Steps */}
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Publication Process</h2>
        <p className="mt-1 text-sm text-gray-500">Follow these steps to publish your research</p>
      </div>

      <div className="space-y-6">
        {[
          {
            step: '1',
            title: 'Submit Your Research',
            description: 'Upload your paper or enter its DOI.',
          },
          {
            step: '2',
            title: 'Add Details',
            description: 'Add context, tags, and supplementary materials.',
          },
          {
            step: '3',
            title: 'Review & Publish',
            description: 'Preview and publish to the community.',
          },
          {
            step: '4',
            title: 'Engage & Earn',
            description: 'Get feedback and earn ResearchCoin rewards.',
          },
        ].map((step) => (
          <div key={step.step} className="flex items-start gap-4">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-medium">
              {step.step}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{step.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function SubmitResearchPage() {
  const router = useRouter();

  const handlePaperSelect = (paper: SearchSuggestion) => {
    if (paper.entityType === 'paper') {
      if (paper.doi) {
        router.push(`/work?doi=${encodeURIComponent(paper.doi)}`);
      }
    }
  };

  const handleContinueWithoutDOI = () => {
    router.push('/notebook/new');
  };

  return (
    <PageLayout rightSidebar={<RightSidebar />}>
      <div>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Publish your research</h1>
          <p className="mt-3 text-gray-500">
            Join the open science movement and make your research accessible to everyone
          </p>
        </div>

        {/* Search Box */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Paper</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by DOI or Title
              </label>
              <div className="w-full">
                <Search onSelect={handlePaperSelect} />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-sm text-gray-500">or</span>
            </div>
          </div>

          <Button
            variant="outlined"
            onClick={handleContinueWithoutDOI}
            className="w-full justify-center py-2.5"
          >
            Continue without DOI
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
