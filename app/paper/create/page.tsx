'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from '@/components/Search/Search';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { RadioGroup } from '@headlessui/react';
import { FileUp, Notebook, Eye, BadgeCheck, BookOpen, Loader2 } from 'lucide-react';
import type { SearchSuggestion } from '@/types/search';
import { PaperActionCard } from './PaperActionCard';
import { Alert } from '@/components/ui/Alert';

type PublishOption = 'notebook' | 'pdf' | null;

interface SelectedPaper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  doi?: string;
  slug?: string;
  displayName: string;
  openalexId: string;
}

export default function WorkCreatePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPaper, setSelectedPaper] = useState<SelectedPaper | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const showNewBadge = true; // This can be controlled by a feature flag or other logic

  const handlePaperSelect = (paper: SearchSuggestion) => {
    // Only handle paper suggestions
    if (paper.entityType === 'paper') {
      setSelectedPaper({
        id: paper.id?.toString() || paper.openalexId,
        title: paper.displayName,
        authors: paper.authors,
        abstract: undefined,
        slug: paper.slug || paper.id?.toString() || paper.openalexId,
        displayName: paper.displayName,
        openalexId: paper.openalexId,
      });
      setShowSuggestions(false);
    } else {
      console.log('User suggestion selected:', paper);
    }
  };

  const publishOptions = [
    {
      id: 'notebook',
      title: 'Draft in Lab Notebook',
      description: 'Write and format your research directly in our editor',
      icon: Notebook,
    },
    {
      id: 'pdf',
      title: 'Upload your manuscript',
      description: 'Upload your existing manuscript',
      icon: FileUp,
    },
  ];

  const handleOptionClick = (optionId: PublishOption) => {
    startTransition(() => {
      if (optionId === 'pdf') {
        router.push('/paper/create/pdf');
      } else if (optionId === 'notebook') {
        router.push(`/notebook?newResearch=true`);
      }
    });
  };

  return (
    <PageLayout>
      <div className="w-full max-w-3xl mx-auto mt-6 px-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mt-4 mb-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <FileUp className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Submit your paper</h1>
          <p className="text-lg text-gray-600 text-center max-w-xl">
            Share your original work with the ResearchHub community.
          </p>
        </div>

        {selectedPaper ? (
          <div className="space-y-6">
            {/* Selected Paper Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Selected Paper</div>
              <h3 className="font-medium text-gray-900">{selectedPaper.title}</h3>
              {selectedPaper.authors && selectedPaper.authors.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPaper.authors.slice(0, 3).join(', ')}
                  {selectedPaper.authors.length > 3 ? ', et al.' : ''}
                </p>
              )}
              {selectedPaper.doi && (
                <p className="text-sm text-gray-500 mt-1">DOI: {selectedPaper.doi}</p>
              )}
            </div>

            <div className="space-y-4">
              <PaperActionCard
                icon={Eye}
                title="View paper"
                description="View paper on ResearchHub"
                onClick={() => router.push(`/paper/${selectedPaper.id}/${selectedPaper.slug}`)}
              />

              <PaperActionCard
                icon={BadgeCheck}
                title="Claim paper"
                description="Claim paper to earn ResearchCoin rewards"
                onClick={() =>
                  router.push(`/paper/${selectedPaper.id}/${selectedPaper.slug}/claim`)
                }
              />

              <PaperActionCard
                icon={BookOpen}
                title="Publish in ResearchHub Journal"
                description="Fast peer-reviewed publication with 14-day decision"
                onClick={() =>
                  router.push(`/paper/${selectedPaper.id}/${selectedPaper.slug}/publish`)
                }
                badge={showNewBadge ? 'NEW' : undefined}
              />
            </div>

            <div>
              <button
                onClick={() => setSelectedPaper(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Search for a different paper
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Do you have a preprint published?
              </h2>
              <p className="text-gray-500 mb-6">
                Search by DOI or title to find your published preprint
              </p>

              <div className="relative">
                <Search
                  displayMode="inline"
                  showSuggestionsOnFocus={!selectedPaper || showSuggestions}
                  className="w-full [&_input]:bg-white"
                  placeholder="Search for your preprint"
                  onSelect={handlePaperSelect}
                />
              </div>

              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">or</span>
                </div>
              </div>
            </div>
            */}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Choose one:</h2>
              <p className="text-gray-500 mb-6">
                Select how you would like to submit your research to ResearchHub.
              </p>
              <div className="space-y-4">
                {publishOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant="outlined"
                      size="lg"
                      className="w-full flex items-center gap-2"
                      onClick={() => !isPending && handleOptionClick(option.id as PublishOption)}
                      disabled={isPending}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {option.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
