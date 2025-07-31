import { TransformedWork, Enrichment, transformWork } from '@/types/work';
import { Paper as TransformedPaper, transformPaper } from '@/types/paper';
import { Paper } from './queries';

// Map GraphQL Paper to TransformedWork for backward compatibility
export function mapGraphQLPaperToWork(paper: Paper): TransformedWork {
  const transformedPaper = transformPaper(paper);

  // Map enrichments to Work enrichments format
  const enrichments: Enrichment[] = transformedPaper.enrichments.map((e) => ({
    source: e.source,
    citationCount: e.citationCount || null,
    influentialCitationCount: e.influentialCitationCount || null,
    altmetricScore: e.altmetricScore || null,
    impactScore: e.impactScore || null,
    journal: e.journal || null,
    tldr: e.tldr || null,
    twitterMentions: e.twitterMentions || null,
    newsMentions: e.newsMentions || null,
  }));

  // Create a raw work object that matches the expected format
  const rawWork = {
    id: parseInt(transformedPaper.id) || 0,
    work_type: 'article',
    content_type: 'paper',
    title: transformedPaper.title,
    paper_title: transformedPaper.title,
    slug: transformedPaper.doi || transformedPaper.id,
    created_date: transformedPaper.date,
    paper_publish_date: transformedPaper.date,
    doi: transformedPaper.doi,
    abstract: transformedPaper.abstract,
    renderable_text: transformedPaper.abstract,
    authors: [],
    raw_authors: transformedPaper.authors
      ? Array.isArray(transformedPaper.authors)
        ? transformedPaper.authors.map((author: string) => ({
            first_name: author.trim().split(' ')[0] || '',
            last_name: author.trim().split(' ').slice(1).join(' ') || '',
          }))
        : transformedPaper.authors.split(',').map((author: string) => ({
            first_name: author.trim().split(' ')[0] || '',
            last_name: author.trim().split(' ').slice(1).join(' ') || '',
          }))
      : [],
    hubs: [],
    pdf_url: transformedPaper.pdfUrl,
    file: transformedPaper.pdfUrl,
    formats: [],
    pdf_license: '',
    pdf_copyright_allows_display: true,
    first_preview: null,
    version_list: [],
    score: transformedPaper.impactScore || 0,
    discussion_count: 0,
    saves_count: 0,
    views_count: 0,
    earned: 0,
    unified_document: null,
    type: 'paper',
    fundraise: null,
    note: null,
    full_markdown: '',
    post_src: '',
    purchases: [],
    image_url: '',
    enrichments: enrichments,
    // Add category information for backward compatibility
    unifiedCategorySlug: transformedPaper.unifiedCategorySlug,
    unifiedSubcategorySlug: transformedPaper.unifiedSubcategorySlug,
  };

  // Use the transformWork function to get proper TransformedWork with raw property
  return transformWork(rawWork);
}
