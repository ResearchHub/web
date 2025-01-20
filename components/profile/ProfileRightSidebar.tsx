'use client';

import { Building2, Globe, Link as LinkIcon } from 'lucide-react';
import { BarChart } from '@/components/charts/BarChart';

export function ProfileRightSidebar() {
  // Mock data for publications histogram
  const publicationData = {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        data: [45678, 52345, 58902, 62341, 71234],
        backgroundColor: '#6366f1',
      },
    ],
  };

  const topics = [
    'Regulation of RNA Processing and Function',
    'Molecular Mechanisms of Plant Development and Regulation',
    'Gene Therapy Techniques and Applications',
  ];

  return (
    <div className="fixed right-0 top-0 w-80 h-screen border-l bg-white p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Stats */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">245.7K</div>
              <div className="text-sm text-gray-600">Publications</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">892.3K</div>
              <div className="text-sm text-gray-600">Citations</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">892</div>
              <div className="text-sm text-gray-600">h-index</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">298.4K</div>
              <div className="text-sm text-gray-600">Works</div>
            </div>
          </div>
        </div>

        {/* Publications Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Publications</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <BarChart data={publicationData} />
          </div>
        </div>

        {/* Topics */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Topics</h3>
          <div className="space-y-2">
            {topics.map((topic) => (
              <a
                key={topic}
                href={`/topic/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                className="block text-sm text-gray-600 hover:text-indigo-600"
              >
                {topic}
              </a>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {['Preprints', 'Open Science', 'Peer Review', 'Scientific Publishing'].map(
              (keyword) => (
                <span
                  key={keyword}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              )
            )}
          </div>
        </div>

        {/* External Links */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Links</h3>
          <div className="space-y-2">
            <a
              href="https://www.biorxiv.org"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Globe className="h-4 w-4 mr-2" />
              Homepage
            </a>
            <a
              href="https://ror.org/04z8jg394"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Building2 className="h-4 w-4 mr-2" />
              ROR Profile
            </a>
            <a
              href="https://crossref.org/biorxiv"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Crossref
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
