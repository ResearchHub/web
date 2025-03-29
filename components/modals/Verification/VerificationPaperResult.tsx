import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { OpenAlexWork } from '@/types/publication';
import { formatTimestamp } from '@/utils/date';

interface Concept {
  id: string;
  displayName: string;
  slug?: string;
}

interface VerificationPaperResultProps {
  result: OpenAlexWork;
}

export const VerificationPaperResult = ({ result }: VerificationPaperResultProps) => {
  // Extract author names from authorships if available
  const authorNames = result.authorships?.map((a) => a.author.displayName) || [];

  // Filter important concepts
  const concepts = result.concepts
    ? result.concepts
        .filter((concept) => concept.level === 1)
        .sort((a, b) => b.relevancyScore - a.relevancyScore)
        .slice(0, 3)
    : [];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-full">
        <div className="font-medium text-gray-900">{result.title}</div>

        <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-2">
          {authorNames.length > 0 && (
            <div>
              {authorNames[0]}
              {authorNames.length > 1 && ' et al.'}
            </div>
          )}

          {result.publicationDate && (
            <>
              <div className="h-3 border-l border-gray-300"></div>
              <div>{formatTimestamp(result.publicationDate)}</div>
            </>
          )}

          {result.doi && (
            <>
              <div className="h-3 border-l border-gray-300"></div>
              <div>
                {result.doiUrl ? (
                  <Link
                    href={result.doiUrl}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {result.doi}
                  </Link>
                ) : (
                  result.doi
                )}
              </div>
            </>
          )}

          {result.venue?.displayName && (
            <>
              <div className="h-3 border-l border-gray-300"></div>
              <div>{result.venue.displayName}</div>
            </>
          )}
        </div>

        {concepts && concepts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {concepts.map((concept, index) => (
              <Badge key={`concept-${index}`} variant="default" className="text-xs">
                {concept.displayName}
              </Badge>
            ))}
          </div>
        )}

        {result.authorshipPosition && (
          <div className="text-sm text-gray-500 mt-1">
            {result.authorshipPosition === 'first'
              ? 'First Author'
              : result.authorshipPosition === 'last'
                ? 'Last Author'
                : 'Co-Author'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPaperResult;
