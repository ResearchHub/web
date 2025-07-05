'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TransformedWork } from '@/types/work';
import { PaperSearchResult } from '@/lib/graphql/queries';
import { Clock, Quote, TrendingUp, BookOpen, Users, FileText, Twitter } from 'lucide-react';

interface PaperCardProps {
  paper: TransformedWork;
  graphqlData: PaperSearchResult;
}

export function PaperCard({ paper, graphqlData }: PaperCardProps) {
  // Extract enrichment data by source
  const semanticScholarEnrichment = paper.enrichments?.find(e => e.source === 'semantic_scholar');
  const altmetricEnrichment = paper.enrichments?.find(e => e.source === 'altmetric');
  
  // Get citations from any source that has them
  const citations = semanticScholarEnrichment?.citationCount || 
                   altmetricEnrichment?.citationCount || 
                   graphqlData.totalCitations || 
                   0;
  
  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatAuthors = (authors: string) => {
    if (!authors) return 'No authors listed';
    const authorsArray = authors.split(',').map(a => a.trim());
    if (authorsArray.length === 1) return authorsArray[0];
    if (authorsArray.length === 2) return `${authorsArray[0]} and ${authorsArray[1]}`;
    return `${authorsArray[0]} et al.`;
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Category Badge */}
      {paper.topics.length > 0 && (
        <div className="mb-3">
          <Badge 
            variant="default"
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {paper.topics[0].name}
          </Badge>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 leading-tight">{paper.title}</h2>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
          {graphqlData.authors && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{formatAuthors(graphqlData.authors)}</span>
            </div>
          )}
          
          {(semanticScholarEnrichment?.journal || paper.journal?.name) && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">{semanticScholarEnrichment?.journal || paper.journal?.name}</span>
            </div>
          )}
          
          {paper.publishedDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(paper.publishedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {paper.doi && (
          <div className="text-sm text-gray-600 mb-3">
            DOI: <a 
              href={`https://doi.org/${paper.doi}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {paper.doi}
            </a>
          </div>
        )}
      </div>

      {/* TLDR Callout - Only from Semantic Scholar */}
      {semanticScholarEnrichment?.tldr && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
          <div className="flex items-start gap-2">
            <Quote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-blue-800 mb-1">TL;DR</div>
              <p className="text-sm text-blue-700 leading-relaxed">{semanticScholarEnrichment.tldr}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="flex flex-wrap gap-3 mb-4">
        {(semanticScholarEnrichment?.impactScore !== null || graphqlData.maxImpactScore !== null) && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Impact: {(semanticScholarEnrichment?.impactScore || graphqlData.maxImpactScore || 0).toFixed(1)}
            </span>
          </div>
        )}
        
        {citations > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-md">
            <span className="text-sm font-medium text-purple-700">
              Citations: {formatNumber(citations)}
            </span>
          </div>
        )}
        
        {(altmetricEnrichment?.altmetricScore !== null || graphqlData.maxAltmetricScore !== null) && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-md">
            <span className="text-sm font-medium text-orange-700">
              Altmetric: {formatNumber(altmetricEnrichment?.altmetricScore || graphqlData.maxAltmetricScore)}
            </span>
          </div>
        )}
        
        {semanticScholarEnrichment?.influentialCitationCount !== null && semanticScholarEnrichment?.influentialCitationCount !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 rounded-md">
            <span className="text-sm font-medium text-indigo-700">
              Influential: {formatNumber(semanticScholarEnrichment.influentialCitationCount)}
            </span>
          </div>
        )}
        
        {(altmetricEnrichment?.twitterMentions && altmetricEnrichment.twitterMentions > 0) && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md">
            <Twitter className="w-3 h-3 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {formatNumber(altmetricEnrichment?.twitterMentions || 0)}
            </span>
          </div>
        )}
        
        {(altmetricEnrichment?.newsMentions && altmetricEnrichment.newsMentions > 0) && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md">
            <span className="text-sm font-medium text-red-700">
              News: {formatNumber(altmetricEnrichment?.newsMentions || 0)}
            </span>
          </div>
        )}
        
        {/* PDF Link */}
        {paper.formats?.some(f => f.type === 'PDF') && (
          <a 
            href={paper.formats.find(f => f.type === 'PDF')?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">PDF</span>
          </a>
        )}
      </div>
    </Card>
  );
}