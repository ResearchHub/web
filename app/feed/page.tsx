'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import { ADVANCED_PAPER_SEARCH, AdvancedPaperSearchResponse } from '@/lib/graphql/queries';
import { mapGraphQLPaperToWork } from '@/lib/graphql/mappers';
import { TransformedWork } from '@/types/work';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { CategorySelector } from '@/components/Feed/CategorySelector';
import { PaperCard } from '@/components/Feed/PaperCard';
import { Slider } from '@/components/ui/Slider';

function FeedContent() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minCitations, setMinCitations] = useState<number>(0);
  
  const { loading, error, data, refetch } = useQuery<{ advancedPaperSearch: AdvancedPaperSearchResponse }>(
    ADVANCED_PAPER_SEARCH,
    {
      variables: {
        searchInput: {
          ...(selectedCategories.length > 0 && { categories: selectedCategories }),
          timePeriod: 'LAST_WEEK',
          sortBy: 'IMPACT_SCORE',
          sortOrder: 'DESC',
          limit: 20,
          ...(minCitations > 0 && { minCitations }),
          hasEnrichment: true,
        },
      },
    }
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Alert.Title>Error loading feed</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert>
      </div>
    );
  }

  const rawPapers = data?.advancedPaperSearch.papers || [];
  const papers: TransformedWork[] = rawPapers.map(mapGraphQLPaperToWork);

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    refetch();
  };

  const handleCitationsChange = (value: number[]) => {
    setMinCitations(value[0]);
    refetch();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Research Feed</h1>
      
      <CategorySelector 
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />
      
      <div className="mb-6 max-w-md">
        <Slider
          label="Minimum Citations"
          value={[minCitations]}
          onValueChange={handleCitationsChange}
          min={0}
          max={100}
          step={1}
          helperText={`Show papers with ${minCitations}+ citations`}
        />
      </div>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>
          Showing {papers.length} papers from the last week{minCitations > 0 ? ` with ${minCitations}+ citations` : ''}
          {selectedCategories.length > 0 && ` in ${selectedCategories.length} selected categories`}
        </p>
        {data?.advancedPaperSearch.totalCount && (
          <p>Total available: {data.advancedPaperSearch.totalCount}</p>
        )}
      </div>

      <div className="space-y-4">
        {papers.map((paper, index) => (
          <PaperCard 
            key={`${paper.doi}-${index}`}
            paper={paper}
            graphqlData={rawPapers[index]}
          />
        ))}
      </div>

      {data?.advancedPaperSearch.hasMore && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">More papers available</p>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <ApolloProvider client={client}>
      <FeedContent />
    </ApolloProvider>
  );
}