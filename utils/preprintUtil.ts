/**
 * Utility functions for preprint server handling
 */

// Map of preprint server slugs to their logo paths
// Returns 'rhJournal2' for ResearchHub Journal (special case for Icon component)
// Returns image path for other preprint servers
// Returns null if not a recognized preprint server
export const getSourceLogo = (source: string): string | null => {
  const sourceLower = source.toLowerCase();
  switch (sourceLower) {
    case 'arxiv':
      return '/logos/arxiv.png';
    case 'biorxiv':
      return '/logos/biorxiv.png';
    case 'chemrxiv':
      return '/logos/chemrxiv.png';
    case 'medrxiv':
      return '/logos/medrxiv.jpg';
    case 'researchhub-journal':
      return 'rhJournal2';
    default:
      return null;
  }
};

// Check if a slug is a recognized preprint server
export const isPreprintServer = (slug: string): boolean => {
  return getSourceLogo(slug) !== null;
};

// Alias for getSourceLogo (for consistency with other naming conventions)
export const get_document_metadata = getSourceLogo;

// Get display name for preprint servers
export const getPreprintDisplayName = (slug: string): string => {
  const sourceLower = slug.toLowerCase();
  switch (sourceLower) {
    case 'arxiv':
      return 'arXiv';
    case 'biorxiv':
      return 'bioRxiv';
    case 'chemrxiv':
      return 'ChemRxiv';
    case 'medrxiv':
      return 'medRxiv';
    case 'researchhub-journal':
      return 'RH Journal';
    default:
      return slug;
  }
};
