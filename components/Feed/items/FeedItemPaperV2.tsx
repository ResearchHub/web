'use client';

import { useState } from 'react';
import { CardWrapper } from '@/components/Feed/CardWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { TransformedWork } from '@/types/work';
import { Paper } from '@/lib/graphql/queries';
import { AuthorList, Author } from '@/components/ui/AuthorList';
import { Users, FileText, Eye, CheckSquare, BookOpen, TrendingUp } from 'lucide-react';
import { ImpactScoreTooltip } from '@/components/tooltips/ImpactScoreTooltip';
import { formatTimeAgo } from '@/utils/date';

interface FeedItemPaperV2Props {
  paper: TransformedWork;
  graphqlData: Paper;
  onCategoryClick?: (categorySlug: string) => void;
  onSubcategoryClick?: (subcategorySlug: string) => void;
  onSourceClick?: (source: string) => void;
}

export function FeedItemPaperV2({
  paper,
  graphqlData,
  onCategoryClick,
  onSubcategoryClick,
  onSourceClick,
}: FeedItemPaperV2Props) {
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

  // Get news mentions from enrichments
  const newsMentions =
    altmetricEnrichment?.newsMentions || semanticScholarEnrichment?.newsMentions || 0;

  // Convert authors array to Author array for AuthorList
  const parseAuthors = (authorsData: string | string[]): Author[] => {
    if (!authorsData) return [];

    // Handle new array format
    if (Array.isArray(authorsData)) {
      return authorsData.map((name) => ({
        name: name.trim(),
      }));
    }

    // Handle legacy string format (backward compatibility)
    const cleanedString = authorsData
      .replace(/[\[\]"']/g, '') // Remove brackets and quotes
      .trim();
    return cleanedString.split(',').map((name) => ({
      name: name.trim(),
    }));
  };

  const formatCategoryName = (slug: string) => {
    return slug.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

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

    const pattern = new RegExp(`\\b(${keywords.join('|')})\\b(?=:?\\s|\\.)`, 'gi');
    return abstract.replace(pattern, '<strong>$1</strong>');
  };

  const authors = parseAuthors(graphqlData.authors || '');

  // Construct DOI URL if available
  const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : undefined;

  return (
    <CardWrapper>
      <div className="p-4">
        {/* Top Row - Badges and Impact Score */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            {graphqlData.unifiedCategory?.slug && (
              <Badge
                variant="default"
                className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer font-medium"
                onClick={() => onCategoryClick?.(graphqlData.unifiedCategory?.slug || '')}
              >
                {formatCategoryName(graphqlData.unifiedCategory.slug)}
              </Badge>
            )}
            {graphqlData.unifiedSubcategory?.slug && (
              <Badge
                variant="default"
                className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                onClick={() => onSubcategoryClick?.(graphqlData.unifiedSubcategory?.slug || '')}
              >
                {formatCategoryName(graphqlData.unifiedSubcategory.slug)}
              </Badge>
            )}
          </div>

          {/* Impact Score Badge */}
          {impactScore !== null && impactScore !== undefined && impactScore > 0 && (
            <Tooltip
              content={
                <ImpactScoreTooltip
                  impactScore={impactScore}
                  citations={citations}
                  twitterMentions={twitterMentions}
                  newsMentions={newsMentions}
                  altmetricScore={altmetricEnrichment?.altmetricScore}
                />
              }
              width="w-72"
              position="top"
            >
              <div className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 cursor-help">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">{Math.round(impactScore)}</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Title - clickable if DOI exists */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {doiUrl ? (
            <a
              href={doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              {paper.title}
            </a>
          ) : (
            paper.title
          )}
        </h2>

        {/* Publication date and source */}
        {paper.publishedDate && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Published</span>
            {graphqlData.source && onSourceClick ? (
              <>
                <span>in</span>
                <button
                  onClick={() => onSourceClick(graphqlData.source!)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  {graphqlData.source}
                </button>
              </>
            ) : graphqlData.source ? (
              <>
                <span>in</span>
                <span className="font-medium">{graphqlData.source}</span>
              </>
            ) : null}
            <span>•</span>
            <span>{formatTimeAgo(new Date(paper.publishedDate).toISOString())}</span>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-6 text-gray-600">
          {authors.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
              <div className="flex-1">
                <AuthorList
                  authors={authors}
                  size="base"
                  delimiter={', '}
                  className="text-gray-600 font-normal"
                  delimiterClassName="text-gray-400"
                  showAbbreviatedInMobile={true}
                  maxLength={3}
                />
              </div>
            </div>
          )}

          {graphqlData.source && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-base text-gray-600">{graphqlData.source}</span>
            </div>
          )}
        </div>

        {/* Key Finding / TLDR Section */}
        {semanticScholarEnrichment?.tldr && (
          <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                Key Finding
              </span>
            </div>
            <p className="text-gray-800 leading-relaxed">{semanticScholarEnrichment.tldr}</p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 mb-4"></div>

        {/* Action Buttons - Right aligned */}
        <div className="flex justify-end gap-3">
          {graphqlData.abstract && (
            <Button variant="outlined" size="md" onClick={() => setShowAbstract(!showAbstract)}>
              <Eye className="w-4 h-4 mr-2" />
              {showAbstract ? 'Hide' : 'Show'} Abstract
            </Button>
          )}
          {graphqlData.pdfUrl && (
            <Button variant="default" size="md" asChild>
              <a
                href={graphqlData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                View PDF
              </a>
            </Button>
          )}
        </div>

        {/* Abstract Content */}
        {graphqlData.abstract && showAbstract && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatAbstract(graphqlData.abstract) }}
            />
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
