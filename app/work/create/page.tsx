'use client';

import { useRouter } from 'next/navigation';
import { Eye, BadgeCheck, BookOpen, ArrowRight } from 'lucide-react';
import { Search } from '@/components/Search/Search';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { CreatePageLayout } from '@/app/layouts/CreatePageLayout';
import { SearchSuggestion } from '@/types/search';
const PaperActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full p-6 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:translate-x-1 transition-all duration-200 flex items-start gap-4 text-left group"
  >
    <div className="flex-shrink-0">
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
    <div className="flex-shrink-0 self-center ml-4">
      <ArrowRight className="w-5 h-5 text-gray-400" />
    </div>
  </button>
);

export default function WorkCreatePage() {
  const router = useRouter();
  const [selectedPaper, setSelectedPaper] = useState<SearchSuggestion | null>(null);

  // Check if we should show the NEW badge (before June 1st 2025)
  const showNewBadge = new Date() < new Date('2025-06-01');

  const handlePaperSelect = (paper: SearchSuggestion) => {
    setSelectedPaper(paper);
  };

  return (
    <CreatePageLayout
      title="Submit your research"
      description="Share your work with the scientific community"
      sidebarTitle="Let's accelerate science together"
      sidebarDescription="ResearchHub is an Open Science platform that incentivizes good scientific behavior"
      stats={[
        { number: '10,000+', label: 'Researchers' },
        { number: '5,000+', label: 'Papers Published' },
        { number: '$2M+', label: 'In Funding' },
        { number: '3,000+', label: 'Active Projects' },
      ]}
    >
      <div className="space-y-8 pb-12">
        {!selectedPaper ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Do you have a preprint published?
            </h2>
            <p className="text-gray-500 mb-6">
              Search by DOI or title to find your published preprint
            </p>

            <div className="space-y-6">
              <Search
                displayMode="inline"
                showSuggestionsOnFocus={false}
                className="w-full"
                placeholder="Search for your preprint"
                onSelect={handlePaperSelect}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">or</span>
                </div>
              </div>

              <div>
                <Button
                  onClick={() => router.push('/work/create/new')}
                  variant="outlined"
                  className="w-full py-6 text-base"
                >
                  I haven't published a preprint yet
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                What would you like to do with this paper?
              </h2>
              <p className="text-gray-500 mb-6">
                Choose how you want to share your research on ResearchHub
              </p>
            </div>

            {/* Selected Paper Preview */}
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="text-sm text-gray-500 mb-1">Selected Paper</div>
              <h3 className="font-medium text-gray-900">{selectedPaper.displayName}</h3>
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
        )}
      </div>
    </CreatePageLayout>
  );
}
