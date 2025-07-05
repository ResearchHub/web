import { PaperSearchResult } from './queries';
import { transformPaper } from '@/types/work';

export const mapGraphQLPaperToWork = (paper: PaperSearchResult) => {
  // Extract enrichment data by source
  const semanticScholarEnrichment = paper.enrichments?.find(e => e.source === 'semantic_scholar');
  const altmetricEnrichment = paper.enrichments?.find(e => e.source === 'altmetric');
  
  // For backward compatibility, use first enrichment as fallback
  const enrichment = paper.enrichments?.[0];
  
  // Parse authors string into array (authors is a string in GraphQL)
  const authorsArray = paper.authors ? paper.authors.split(',').map(a => a.trim()) : [];
  
  // Map GraphQL response to format expected by transformPaper
  const rawPaper = {
    id: 0, // Will need to be set if you have IDs
    work_type: 'article',
    content_type: 'paper',
    title: paper.title,
    paper_title: paper.title,
    slug: '', // Generate from title if needed
    created_date: paper.date,
    paper_publish_date: paper.date,
    doi: paper.doi,
    // Map category to hub structure
    hubs: paper.category ? [{
      id: 0,
      name: paper.category,
      slug: paper.category.toLowerCase().replace(/\s+/g, '-')
    }] : [],
    // Map journal information from semantic scholar first, then fallback
    external_source: semanticScholarEnrichment?.journal || enrichment?.journal || '',
    external_source_id: 0,
    external_source_slug: (semanticScholarEnrichment?.journal || enrichment?.journal)?.toLowerCase().replace(/\s+/g, '-') || '',
    external_source_image: '',
    // Map authors from GraphQL
    raw_authors: authorsArray.map(author => ({
      first_name: author.split(' ')[0] || '',
      last_name: author.split(' ').slice(1).join(' ') || '',
    })),
    authors: [],
    // Use abstract or TLDR from semantic scholar for content
    abstract: paper.abstract || semanticScholarEnrichment?.tldr || '',
    renderable_text: paper.abstract || semanticScholarEnrichment?.tldr || '',
    // Default empty values for required fields
    pdf_url: '',
    file: '',
    formats: [],
    pdf_license: '',
    pdf_copyright_allows_display: true,
    first_preview: null,
    version_list: [],
    score: semanticScholarEnrichment?.impactScore || enrichment?.impactScore || paper.maxImpactScore || 0,
    discussion_count: 0,
    saves_count: 0,
    views_count: 0,
    earned: 0,
    unified_document: null,
    type: 'paper',
    fundraise: null,
    note: null,
    full_markdown: semanticScholarEnrichment?.tldr || '',
    post_src: '',
    purchases: [],
    image_url: '',
    // Pass enrichments array directly from GraphQL
    enrichments: paper.enrichments || [],
  };

  return transformPaper(rawPaper);
};