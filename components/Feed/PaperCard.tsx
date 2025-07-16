'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { TransformedWork } from '@/types/work';
import { Paper } from '@/lib/graphql/queries';
import {
  Calendar,
  Quote,
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  Star,
  Link,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PaperCardProps {
  paper: TransformedWork;
  graphqlData: Paper;
  onCategoryClick?: (categorySlug: string) => void;
  onSubcategoryClick?: (subcategorySlug: string) => void;
  onSourceClick?: (source: string) => void;
}

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function PaperCard({
  paper,
  graphqlData,
  onCategoryClick,
  onSubcategoryClick,
  onSourceClick,
}: PaperCardProps) {
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);

  // Extract enrichment data by source
  const semanticScholarEnrichment = paper.enrichments?.find((e) => e.source === 'semantic_scholar');
  const altmetricEnrichment = paper.enrichments?.find((e) => e.source === 'altmetric');

  // Get citations from any source that has them
  const citations =
    semanticScholarEnrichment?.citationCount || altmetricEnrichment?.citationCount || 0;

  // Get impact score from enrichments
  const impactScore =
    semanticScholarEnrichment?.impactScore || altmetricEnrichment?.impactScore || null;

  // Get Twitter mentions from enrichments
  const twitterMentions =
    altmetricEnrichment?.twitterMentions || semanticScholarEnrichment?.twitterMentions || 0;

  // Check if has influential citations
  const hasInfluentialCitations =
    semanticScholarEnrichment?.influentialCitationCount &&
    semanticScholarEnrichment.influentialCitationCount > 0;

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatAuthors = (authors: string, showAll: boolean = false) => {
    if (!authors) return 'No authors listed';
    const authorsArray = authors.split(',').map((a) => a.trim());

    if (showAll || authorsArray.length <= 2) {
      return authorsArray.join(', ');
    } else {
      const additionalAuthors = authorsArray.length - 2;
      const lastAuthor = authorsArray[authorsArray.length - 1];
      return (
        <>
          {authorsArray[0]}{' '}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAllAuthors(true);
            }}
            className="text-blue-600 hover:underline"
          >
            (+{additionalAuthors} authors)
          </button>{' '}
          and {lastAuthor}
        </>
      );
    }
  };

  const formatCategoryName = (slug: string) => {
    return slug.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };
  console.log('test');
  const formatAbstract = (abstract: string) => {
    // Keywords commonly found in research abstracts
    const keywords = [
      'Abstract',
      'Background',
      'Objective',
      'Objectives',
      'Aim',
      'Aims',
      'Purpose',
      'Methods',
      'Method',
      'Methodology',
      'Materials and Methods',
      'Study Design',
      'Participants',
      'Subjects',
      'Sample',
      'Data',
      'Analysis',
      'Statistical Analysis',
      'Results',
      'Findings',
      'Outcomes',
      'Main Outcome',
      'Primary Outcome',
      'Secondary Outcome',
      'Conclusion',
      'Conclusions',
      'Discussion',
      'Implications',
      'Significance',
      'Limitations',
      'Future Research',
      'Recommendations',
      'Introduction',
      'Hypothesis',
      'Intervention',
      'Control',
      'Experimental',
      'Randomized',
      'Prospective',
      'Retrospective',
      'Cross-sectional',
      'Longitudinal',
      'Cohort',
      'Case-control',
      'Meta-analysis',
      'Systematic Review',
      'Review',
      'Clinical Trial',
      'P-value',
      'Confidence Interval',
      'CI',
      'N =',
      'n =',
    ];

    // Create a regex pattern that matches keywords at word boundaries
    // Case-insensitive matching, but preserve original case
    const pattern = new RegExp(`\\b(${keywords.join('|')})\\b(?=:?\\s|\\.)`, 'gi');

    // Replace keywords with bold versions
    return abstract.replace(pattern, '<strong>$1</strong>');
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      {/* Category and Source Badges */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {graphqlData.unifiedCategory?.slug && (
          <Badge
            variant="default"
            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
            onClick={() => onCategoryClick?.(graphqlData.unifiedCategory?.slug || '')}
          >
            {formatCategoryName(graphqlData.unifiedCategory.slug)}
          </Badge>
        )}
        {graphqlData.unifiedSubcategory?.slug && (
          <Badge
            variant="default"
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
            onClick={() => onSubcategoryClick?.(graphqlData.unifiedSubcategory?.slug || '')}
          >
            {formatCategoryName(graphqlData.unifiedSubcategory.slug)}
          </Badge>
        )}
        {graphqlData.source && (
          <Badge
            variant="default"
            className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSourceClick?.(graphqlData.source)}
          >
            {graphqlData.source}
          </Badge>
        )}
      </div>

      {/* Header with title */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold leading-tight">{paper.title}</h2>
      </div>

      {/* Metadata */}
      <div className="text-sm text-gray-600 space-y-1 mb-3">
        {graphqlData.authors && (
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{formatAuthors(graphqlData.authors, showAllAuthors)}</span>
          </div>
        )}

        {paper.publishedDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Published {new Date(paper.publishedDate).toLocaleDateString()}</span>
          </div>
        )}

        {paper.doi && (
          <div className="flex items-center gap-1">
            <Link className="w-3.5 h-3.5" />
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {paper.doi}
            </a>
          </div>
        )}

        {(semanticScholarEnrichment?.journal || paper.journal?.name) && (
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-medium">
              {semanticScholarEnrichment?.journal || paper.journal?.name}
            </span>
          </div>
        )}
      </div>

      {/* TLDR Callout - Only from Semantic Scholar */}
      {semanticScholarEnrichment?.tldr && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
          <div>
            <div className="text-sm font-semibold text-blue-800 mb-1">TL;DR</div>
            <p className="text-sm text-blue-700 leading-relaxed">
              {semanticScholarEnrichment.tldr}
            </p>
          </div>
        </div>
      )}

      {/* Metrics with Tooltips */}
      <div className="flex flex-wrap gap-2">
        {impactScore !== null && impactScore !== undefined && impactScore > 0 && (
          <Tooltip
            content={
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Impact Score: Measures the influence and reach of this paper</span>
              </div>
            }
            width="w-64"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md cursor-help">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Impact: {Math.round(impactScore)}
              </span>
            </div>
          </Tooltip>
        )}

        {citations > 0 && (
          <Tooltip
            content={
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-purple-600" />
                <span>Citations: Number of times this paper has been cited by other works</span>
              </div>
            }
            width="w-64"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-md cursor-help">
              <Quote className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">{formatNumber(citations)}</span>
            </div>
          </Tooltip>
        )}

        {altmetricEnrichment?.altmetricScore !== null &&
          altmetricEnrichment?.altmetricScore !== undefined &&
          altmetricEnrichment.altmetricScore > 0 && (
            <Tooltip
              content={
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full" />
                  <span>Altmetric Score: Measures online attention and engagement</span>
                </div>
              }
              width="w-64"
            >
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-md cursor-help">
                <span className="text-xs font-medium text-orange-700">
                  Altmetric: {Math.round(altmetricEnrichment.altmetricScore)}
                </span>
              </div>
            </Tooltip>
          )}

        {hasInfluentialCitations && (
          <Tooltip
            content={
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-600" />
                <span>This paper has highly influential citations</span>
              </div>
            }
            width="w-64"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 rounded-md cursor-help">
              <Star className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">Influential</span>
            </div>
          </Tooltip>
        )}

        {twitterMentions > 0 && (
          <Tooltip
            content={
              <div className="flex items-center gap-2">
                <XIcon className="w-4 h-4 text-blue-600" />
                <span>Number of mentions on X (formerly Twitter)</span>
              </div>
            }
            width="w-64"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md cursor-help">
              <XIcon className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {formatNumber(twitterMentions)}
              </span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* Divider */}
      {(graphqlData.abstract || graphqlData.pdfUrl) && (
        <div className="border-t border-gray-200 mt-4 pt-3">
          {/* Action Buttons - Right aligned */}
          <div className="flex justify-end gap-2">
            {graphqlData.abstract && (
              <button
                onClick={() => setShowAbstract(!showAbstract)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                {showAbstract ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {showAbstract ? 'Hide' : 'Show'} Abstract
              </button>
            )}
            {graphqlData.pdfUrl && (
              <a
                href={graphqlData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                PDF
              </a>
            )}
          </div>

          {/* Abstract Content */}
          {graphqlData.abstract && showAbstract && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatAbstract(graphqlData.abstract) }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
