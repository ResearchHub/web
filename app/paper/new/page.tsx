'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileText, Upload } from 'lucide-react';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';

export default function WorkCreatePage() {
  const router = useRouter();

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.entityType === 'paper') {
      if (suggestion.id) {
        router.push(`/paper/${suggestion.id}/${suggestion.slug}`);
      } else if (suggestion.doi) {
        router.push(`/paper?doi=${encodeURIComponent(suggestion.doi)}`);
      }
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="pb-8">
          <div className="inline-block">
            <div className="relative">
              <PageHeader title="Submit your research" className="mb-0 relative z-10" />
            </div>
          </div>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl">
            Share your work with the ResearchHub community and make an impact in the scientific
            world
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <button
            onClick={() => router.push('/notebook')}
            className="relative flex cursor-pointer rounded-2xl p-6 md:p-8 focus:outline-none transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl h-full border border-gray-200 text-left"
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Draft in Lab Notebook</h3>
              <p className="mt-2 text-base text-gray-600">
                Write and format your research directly in our editor
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/paper/preprint/upload')}
            className="relative flex cursor-pointer rounded-2xl p-6 md:p-8 focus:outline-none transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl h-full border border-gray-200 text-left"
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Upload Manuscript</h3>
              <p className="mt-2 text-base text-gray-600">
                Upload a PDF version of your manuscript
              </p>
            </div>
          </button>
        </div>

        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Already published a preprint?
            </h2>
            <p className="text-base text-gray-600 mb-4">
              Speed up the process by finding your paper
            </p>
            <Search
              onSelect={handleSearchSelect}
              placeholder="Search by title or DOI"
              className="w-full"
              displayMode="inline"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
