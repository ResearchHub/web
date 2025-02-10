'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from '@/components/Search/Search';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { RadioGroup } from '@headlessui/react';
import { FileUp, Notebook, Eye, BadgeCheck, BookOpen } from 'lucide-react';
import type { SearchSuggestion } from '@/types/search';
import { PaperActionCard } from './PaperActionCard';

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
  const [selectedPaper, setSelectedPaper] = useState<SelectedPaper | null>(null);
  const [publishOption, setPublishOption] = useState<PublishOption>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const showNewBadge = true; // This can be controlled by a feature flag or other logic

  const handlePaperSelect = (paper: SearchSuggestion) => {
    // Only handle work suggestions
    if (paper.entityType === 'work') {
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
      title: 'Upload a PDF',
      description: 'Upload your existing research paper',
      icon: FileUp,
    },
  ];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="pb-12">
          <PageHeader title="Submit your research" className="mb-0" />
          <p className="mt-2 text-lg text-gray-600">
            Share your work with the ResearchHub community
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
                onClick={() => router.push(`/work/${selectedPaper.id}/${selectedPaper.slug}`)}
              />

              <PaperActionCard
                icon={BadgeCheck}
                title="Claim paper"
                description="Claim paper to earn ResearchCoin rewards"
                onClick={() => router.push(`/work/${selectedPaper.id}/${selectedPaper.slug}/claim`)}
              />

              <PaperActionCard
                icon={BookOpen}
                title="Publish in ResearchHub Journal"
                description="Fast peer-reviewed publication with 14-day decision"
                onClick={() =>
                  router.push(`/work/${selectedPaper.id}/${selectedPaper.slug}/publish`)
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

              <div className="mt-8">
                <RadioGroup value={publishOption} onChange={setPublishOption}>
                  <div className="grid grid-cols-1 gap-4">
                    {publishOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <RadioGroup.Option
                          key={option.id}
                          value={option.id}
                          className={({ checked }) =>
                            `relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none
                            ${
                              checked
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`
                          }
                        >
                          {({ checked }) => (
                            <div className="flex w-full items-start gap-4">
                              <div
                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                                  checked ? 'bg-indigo-100' : 'bg-gray-100'
                                }`}
                              >
                                <Icon
                                  className={`h-5 w-5 ${
                                    checked ? 'text-indigo-600' : 'text-gray-600'
                                  }`}
                                />
                              </div>
                              <div className="flex flex-col">
                                <RadioGroup.Label
                                  as="span"
                                  className={`font-medium ${
                                    checked ? 'text-indigo-900' : 'text-gray-900'
                                  }`}
                                >
                                  {option.title}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="span"
                                  className={`text-sm ${
                                    checked ? 'text-indigo-700' : 'text-gray-500'
                                  }`}
                                >
                                  {option.description}
                                </RadioGroup.Description>
                              </div>
                            </div>
                          )}
                        </RadioGroup.Option>
                      );
                    })}
                  </div>
                </RadioGroup>

                {publishOption && (
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push(`/work/create/${publishOption}`)}
                      variant="default"
                      className="w-full py-6 text-base"
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
