'use client';

import { useState } from 'react';
import { trpc } from '../_trpc/client';
import { type PaperOutput } from '@/types';

export default function PapersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: papers, isLoading } = trpc.paper.getAll.useQuery();
  const { data: searchResults } = trpc.paper.search.useQuery(searchQuery, {
    enabled: searchQuery.length > 0,
  });

  const displayedPapers = searchQuery.length > 0 ? searchResults : papers;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Research Papers</h1>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search papers..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {displayedPapers?.map((paper: PaperOutput) => (
            <div key={paper.id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{paper.title}</h2>
              {paper.abstract && (
                <p className="text-gray-600 mt-2">{paper.abstract}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                Published: {new Date(paper.publishedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 