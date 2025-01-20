export interface Interest {
  id: string;
  name: string;
  type: 'journal' | 'person' | 'topic';
  imageUrl?: string;
  description?: string;
  followers?: number;
  verified?: boolean;
}

export const mockInterests = {
  journals: [
    {
      id: 'nature',
      name: 'Nature',
      type: 'journal' as const,
      description: 'International journal of science',
      followers: 1200000,
      verified: true,
    },
    {
      id: 'science',
      name: 'Science',
      type: 'journal' as const,
      description: "The world's leading outlet for scientific news",
      followers: 980000,
      verified: true,
    },
    {
      id: 'cell',
      name: 'Cell',
      type: 'journal' as const,
      description: 'Leading journal in life sciences',
      followers: 850000,
      verified: true,
    },
    {
      id: 'nejm',
      name: 'New England Journal of Medicine',
      type: 'journal' as const,
      description: 'Leading medical research journal',
      followers: 890000,
      verified: true,
    },
    {
      id: 'lancet',
      name: 'The Lancet',
      type: 'journal' as const,
      description: 'Prestigious medical journal since 1823',
      followers: 820000,
      verified: true,
    },
    {
      id: 'pnas',
      name: 'PNAS',
      type: 'journal' as const,
      description: 'Proceedings of the National Academy of Sciences',
      followers: 680000,
      verified: true,
    },
    {
      id: 'nature_medicine',
      name: 'Nature Medicine',
      type: 'journal' as const,
      description: 'Premier journal for medical research',
      followers: 560000,
      verified: true,
    },
    {
      id: 'nature_biotech',
      name: 'Nature Biotechnology',
      type: 'journal' as const,
      description: 'Leading journal in biotechnology',
      followers: 480000,
      verified: true,
    },
    {
      id: 'nature_neuro',
      name: 'Nature Neuroscience',
      type: 'journal' as const,
      description: 'Leading neuroscience research journal',
      followers: 440000,
      verified: true,
    },
    {
      id: 'cell_stem_cell',
      name: 'Cell Stem Cell',
      type: 'journal' as const,
      description: 'Premier journal for stem cell research',
      followers: 320000,
      verified: true,
    },
  ],
  people: [
    {
      id: 'jennifer_doudna',
      name: 'Jennifer Doudna',
      type: 'person' as const,
      description: 'Nobel laureate, CRISPR pioneer at UC Berkeley',
      followers: 250000,
      verified: true,
    },
    {
      id: 'francis_collins',
      name: 'Francis Collins',
      type: 'person' as const,
      description: 'Former NIH Director, Human Genome Project leader',
      followers: 220000,
      verified: true,
    },
    {
      id: 'emmanuelle_charpentier',
      name: 'Emmanuelle Charpentier',
      type: 'person' as const,
      description: 'Nobel laureate, CRISPR pioneer',
      followers: 190000,
      verified: true,
    },
    {
      id: 'feng_zhang',
      name: 'Feng Zhang',
      type: 'person' as const,
      description: 'CRISPR pioneer at MIT-Harvard Broad Institute',
      followers: 180000,
      verified: true,
    },
    {
      id: 'george_church',
      name: 'George Church',
      type: 'person' as const,
      description: 'Genetics pioneer, synthetic biology researcher',
      followers: 175000,
      verified: true,
    },
    {
      id: 'david_liu',
      name: 'David Liu',
      type: 'person' as const,
      description: 'Pioneer in base editing and protein evolution',
      followers: 145000,
      verified: true,
    },
    {
      id: 'mary_claire_king',
      name: 'Mary-Claire King',
      type: 'person' as const,
      description: 'Discovered BRCA1 gene, breast cancer research',
      followers: 135000,
      verified: true,
    },
    {
      id: 'karl_deisseroth',
      name: 'Karl Deisseroth',
      type: 'person' as const,
      description: 'Pioneer in optogenetics and CLARITY',
      followers: 130000,
      verified: true,
    },
    {
      id: 'svante_paabo',
      name: 'Svante Pääbo',
      type: 'person' as const,
      description: 'Pioneer in paleogenetics, Nobel laureate',
      followers: 120000,
      verified: true,
    },
    {
      id: 'carolyn_bertozzi',
      name: 'Carolyn Bertozzi',
      type: 'person' as const,
      description: 'Pioneer in bioorthogonal chemistry, Nobel laureate',
      followers: 140000,
      verified: true,
    },
  ],
  topics: [
    {
      id: 'ai_ml',
      name: 'AI & Machine Learning',
      type: 'topic' as const,
      description: 'Artificial intelligence and machine learning research',
      followers: 890000,
      verified: true,
    },
    {
      id: 'crispr',
      name: 'CRISPR Technology',
      type: 'topic' as const,
      description: 'Gene editing and therapeutic applications',
      followers: 450000,
      verified: true,
    },
    {
      id: 'cancer_research',
      name: 'Cancer Research',
      type: 'topic' as const,
      description: 'Cancer biology and treatment advances',
      followers: 560000,
      verified: true,
    },
    {
      id: 'neuroscience',
      name: 'Neuroscience',
      type: 'topic' as const,
      description: 'Brain function and nervous system research',
      followers: 520000,
      verified: true,
    },
    {
      id: 'immunology',
      name: 'Immunology',
      type: 'topic' as const,
      description: 'Immune system and disease research',
      followers: 420000,
      verified: true,
    },
    {
      id: 'genomics',
      name: 'Genomics',
      type: 'topic' as const,
      description: 'Genome sequencing and analysis',
      followers: 390000,
      verified: true,
    },
    {
      id: 'quantum_computing',
      name: 'Quantum Computing',
      type: 'topic' as const,
      description: 'Quantum information science and computing',
      followers: 380000,
      verified: true,
    },
    {
      id: 'climate_science',
      name: 'Climate Science',
      type: 'topic' as const,
      description: 'Climate change and environmental research',
      followers: 680000,
      verified: true,
    },
    {
      id: 'synthetic_biology',
      name: 'Synthetic Biology',
      type: 'topic' as const,
      description: 'Engineering biological systems',
      followers: 280000,
      verified: true,
    },
    {
      id: 'drug_discovery',
      name: 'Drug Discovery',
      type: 'topic' as const,
      description: 'Pharmaceutical research and development',
      followers: 340000,
      verified: true,
    },
  ],
};

export function fetchInterests(type: 'journal' | 'person' | 'topic'): Promise<Interest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (type) {
        case 'journal':
          resolve(mockInterests.journals);
          break;
        case 'person':
          resolve(mockInterests.people);
          break;
        case 'topic':
          resolve(mockInterests.topics);
          break;
        default:
          resolve([]);
      }
    }, 500);
  });
}
