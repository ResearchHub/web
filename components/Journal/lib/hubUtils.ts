// Utility function to generate slugs
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars (except hyphens)
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim hyphens from start and end
};

// Specific overrides for certain hub names
export const HUB_URL_OVERRIDES: { [key: string]: string | undefined } = {
  'Molecular Biology': 'molecular-biology-1',
  'Pharmaceutical Science': 'pharmaceutical-science-1',
  Pharmacology: 'pharmacology-and-toxicology',
};

// Function to get the correct hub slug, considering overrides
export const getHubSlug = (name: string): string => {
  return HUB_URL_OVERRIDES[name] ?? slugify(name);
};
