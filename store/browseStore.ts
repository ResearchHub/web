export interface BrowseHub {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  avatar: string;
  followerCount: number;
  memberCount: number;
  createdDate: string;
  type: 'journal' | 'community';
  rules: string[];
  isFollowing?: boolean;
  tags: string[];
  editorCount: number;
  recentActivity: string;
}

export interface BrowseAuthor {
  id: string;
  name: string;
  username: string;
  headline: string;
  bio: string;
  avatar: string;
  followerCount: number;
  followingCount: number;
  publicationCount: number;
  citationCount: number;
  hIndex: number;
  affiliation: string;
  expertise: string[];
  isFollowing?: boolean;
  isVerified: boolean;
  joinedDate: string;
  coauthoredPapers?: {
    title: string;
    year: number;
    journal?: string;
  }[];
}

export const mockHubs: BrowseHub[] = [
  {
    id: 'hub-1',
    name: 'BioScience',
    slug: 'bioscience',
    headline: 'Premier journal for biological research and discoveries',
    description:
      'A leading peer-reviewed journal publishing high-impact research across all biological disciplines.',
    avatar: '🔬',
    followerCount: 12450,
    memberCount: 3200,
    createdDate: '2022-03-15',
    type: 'journal',
    rules: [
      'All submissions must be peer-reviewed',
      'Original research only',
      'Proper citation required',
      'Ethical approval for human/animal studies',
    ],
    tags: ['biology', 'research', 'peer-review'],
    editorCount: 15,
    recentActivity: '2 hours ago',
  },
  {
    id: 'hub-2',
    name: "Alzheimer's Research",
    slug: 'alzheimers-research',
    headline: "Advancing understanding and treatment of Alzheimer's disease",
    description:
      "A collaborative community dedicated to sharing the latest research, treatments, and breakthroughs in Alzheimer's disease.",
    avatar: '🧠',
    followerCount: 8930,
    memberCount: 2100,
    createdDate: '2021-11-20',
    type: 'community',
    rules: [
      'Evidence-based discussions only',
      'Respect patient privacy',
      'No medical advice to individuals',
      'Cite all research claims',
    ],
    tags: ['neuroscience', 'alzheimers', 'dementia', 'aging'],
    editorCount: 8,
    recentActivity: '45 minutes ago',
  },
  {
    id: 'hub-3',
    name: 'Climate Science Today',
    slug: 'climate-science-today',
    headline: 'Understanding our changing planet through rigorous science',
    description:
      'A hub for climate researchers, policy makers, and concerned scientists working on climate change solutions.',
    avatar: '🌍',
    followerCount: 15600,
    memberCount: 4800,
    createdDate: '2020-09-10',
    type: 'community',
    rules: [
      'Scientific consensus respected',
      'Data-driven discussions',
      'No climate denial content',
      'Constructive policy debate encouraged',
    ],
    tags: ['climate', 'environment', 'sustainability', 'policy'],
    editorCount: 12,
    recentActivity: '1 hour ago',
  },
  {
    id: 'hub-4',
    name: 'Quantum Physics Journal',
    slug: 'quantum-physics-journal',
    headline: 'Exploring the quantum realm and its applications',
    description:
      'Publishing cutting-edge research in quantum mechanics, quantum computing, and quantum technologies.',
    avatar: '⚛️',
    followerCount: 6780,
    memberCount: 1800,
    createdDate: '2023-01-05',
    type: 'journal',
    rules: [
      'Mathematical rigor required',
      'Experimental validation preferred',
      'Theoretical work must be novel',
      'Code availability for computational work',
    ],
    tags: ['quantum', 'physics', 'computing', 'theory'],
    editorCount: 10,
    recentActivity: '3 hours ago',
  },
  {
    id: 'hub-5',
    name: 'AI Ethics Collective',
    slug: 'ai-ethics-collective',
    headline: 'Ensuring responsible development of artificial intelligence',
    description:
      'A multidisciplinary community examining the ethical implications of AI and machine learning technologies.',
    avatar: '🤖',
    followerCount: 11200,
    memberCount: 2900,
    createdDate: '2021-06-18',
    type: 'community',
    rules: [
      'Interdisciplinary perspectives welcome',
      'Real-world case studies preferred',
      'Bias awareness required',
      'Solution-oriented discussions',
    ],
    tags: ['ai', 'ethics', 'philosophy', 'technology'],
    editorCount: 7,
    recentActivity: '30 minutes ago',
  },
  {
    id: 'hub-6',
    name: 'Nature Genetics',
    slug: 'nature-genetics',
    headline: 'Premier destination for genetic and genomic research',
    description:
      'Publishing groundbreaking discoveries in human, medical, and statistical genetics.',
    avatar: '🧬',
    followerCount: 18900,
    memberCount: 5200,
    createdDate: '2019-04-12',
    type: 'journal',
    rules: [
      'High impact discoveries only',
      'Rigorous statistical analysis',
      'Data sharing encouraged',
      'Reproducibility standards enforced',
    ],
    tags: ['genetics', 'genomics', 'medicine', 'statistics'],
    editorCount: 20,
    recentActivity: '15 minutes ago',
  },
  {
    id: 'hub-7',
    name: 'Space Medicine Hub',
    slug: 'space-medicine-hub',
    headline: 'Healthcare challenges and solutions for space exploration',
    description:
      'Advancing medical knowledge for astronaut health and long-duration spaceflight missions.',
    avatar: '🚀',
    followerCount: 4560,
    memberCount: 1200,
    createdDate: '2022-08-30',
    type: 'community',
    rules: [
      'Space-relevant research focus',
      'Collaboration with space agencies',
      'Safety protocols paramount',
      'Innovation encouraged',
    ],
    tags: ['space', 'medicine', 'aerospace', 'health'],
    editorCount: 6,
    recentActivity: '2 hours ago',
  },
  {
    id: 'hub-8',
    name: 'Marine Biology Frontiers',
    slug: 'marine-biology-frontiers',
    headline: 'Exploring life beneath the waves',
    description:
      'Research on marine ecosystems, conservation, and the impacts of climate change on ocean life.',
    avatar: '🐋',
    followerCount: 9340,
    memberCount: 2600,
    createdDate: '2020-12-03',
    type: 'community',
    rules: [
      'Conservation focus encouraged',
      'Field work documentation required',
      'Species identification accuracy',
      'Ethical wildlife research',
    ],
    tags: ['marine', 'biology', 'conservation', 'ecology'],
    editorCount: 9,
    recentActivity: '4 hours ago',
  },
  {
    id: 'hub-9',
    name: 'Synthetic Biology Review',
    slug: 'synthetic-biology-review',
    headline: "Engineering biological systems for tomorrow's challenges",
    description:
      'Peer-reviewed research in synthetic biology, bioengineering, and biotechnology applications.',
    avatar: '🧪',
    followerCount: 7200,
    memberCount: 1900,
    createdDate: '2023-02-14',
    type: 'journal',
    rules: [
      'Biosafety considerations mandatory',
      'Reproducible protocols required',
      'Ethical review for all work',
      'Open science practices encouraged',
    ],
    tags: ['synthetic-biology', 'bioengineering', 'biotechnology'],
    editorCount: 11,
    recentActivity: '1 hour ago',
  },
  {
    id: 'hub-10',
    name: 'Computational Neuroscience',
    slug: 'computational-neuroscience',
    headline: 'Modeling the brain through mathematics and computation',
    description:
      'A community for researchers using computational approaches to understand brain function and cognition.',
    avatar: '🖥️',
    followerCount: 10800,
    memberCount: 3100,
    createdDate: '2021-01-25',
    type: 'community',
    rules: [
      'Code sharing encouraged',
      'Mathematical models required',
      'Biological plausibility important',
      'Collaborative projects welcomed',
    ],
    tags: ['neuroscience', 'computation', 'modeling', 'brain'],
    editorCount: 8,
    recentActivity: '20 minutes ago',
  },
  {
    id: 'hub-11',
    name: 'bioRxiv',
    slug: 'biorxiv',
    headline: 'The preprint server for biology',
    description:
      'bioRxiv is a free online archive and distribution service for unpublished preprints in the life sciences.',
    avatar: 'https://www.biorxiv.org/sites/default/files/images/biorxiv_logo_homepage.png',
    followerCount: 45200,
    memberCount: 12800,
    createdDate: '2013-11-11',
    type: 'journal',
    rules: [
      'Preprints only - not peer reviewed',
      'Life sciences research focus',
      'No copyright restrictions',
      'Creative Commons license required',
    ],
    tags: ['preprint', 'biology', 'life-sciences', 'open-access'],
    editorCount: 25,
    recentActivity: '5 minutes ago',
  },
  {
    id: 'hub-12',
    name: 'arXiv',
    slug: 'arxiv',
    headline: 'Open-access archive for scholarly articles',
    description:
      'arXiv is a free distribution service and open-access archive for scholarly articles in physics, mathematics, computer science, and more.',
    avatar: 'https://arxiv.org/icons/favicon-16x16.png',
    followerCount: 78900,
    memberCount: 28500,
    createdDate: '1991-08-14',
    type: 'journal',
    rules: [
      'Scholarly articles in STEM fields',
      'No peer review requirement',
      'Open access mandate',
      'Subject classification required',
    ],
    tags: ['preprint', 'physics', 'mathematics', 'computer-science', 'open-access'],
    editorCount: 35,
    recentActivity: '2 minutes ago',
  },
];

export const mockAuthors: BrowseAuthor[] = [
  {
    id: 'author-1',
    name: 'Dr. Sarah Chen',
    username: 'sarahchen',
    headline: 'Pioneering CRISPR gene therapy for neurological disorders',
    bio: "Leading researcher in gene editing technologies with focus on treating Huntington's and Alzheimer's diseases.",
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    followerCount: 8450,
    followingCount: 342,
    publicationCount: 127,
    citationCount: 15600,
    hIndex: 42,
    affiliation: 'Stanford University School of Medicine',
    expertise: ['CRISPR', 'Gene Therapy', 'Neuroscience', "Alzheimer's"],
    isFollowing: false,
    isVerified: true,
    joinedDate: '2019-03-15',
  },
  {
    id: 'author-2',
    name: 'Prof. Marcus Rodriguez',
    username: 'marcusrod',
    headline: 'Climate modeling and machine learning for environmental science',
    bio: 'Developing AI models to predict climate patterns and assess environmental risks for policy decision-making.',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    followerCount: 12300,
    followingCount: 567,
    publicationCount: 89,
    citationCount: 22400,
    hIndex: 38,
    affiliation: 'MIT Climate Lab',
    expertise: ['Climate Science', 'Machine Learning', 'Environmental Policy', 'Data Science'],
    isFollowing: true,
    isVerified: true,
    joinedDate: '2018-07-22',
    coauthoredPapers: [
      {
        title: 'Machine Learning Approaches to Climate Risk Assessment',
        year: 2023,
        journal: 'Nature Climate Change',
      },
      {
        title: 'Predictive Models for Extreme Weather Events',
        year: 2022,
        journal: 'Science',
      },
    ],
  },
  {
    id: 'author-3',
    name: 'Dr. Priya Patel',
    username: 'priyapatel',
    headline: 'Quantum computing applications in drug discovery',
    bio: 'Exploring how quantum algorithms can revolutionize molecular simulation and pharmaceutical research.',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    followerCount: 6720,
    followingCount: 198,
    publicationCount: 56,
    citationCount: 8900,
    hIndex: 28,
    affiliation: 'IBM Quantum Network',
    expertise: ['Quantum Computing', 'Drug Discovery', 'Molecular Simulation', 'Pharmaceuticals'],
    isFollowing: false,
    isVerified: true,
    joinedDate: '2020-11-08',
  },
  {
    id: 'author-4',
    name: 'Dr. James Thompson',
    username: 'jamesthompson',
    headline: 'Marine conservation and ecosystem restoration',
    bio: 'Working to protect coral reefs and marine biodiversity through innovative conservation technologies.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    followerCount: 4890,
    followingCount: 289,
    publicationCount: 78,
    citationCount: 6700,
    hIndex: 31,
    affiliation: 'Woods Hole Oceanographic Institution',
    expertise: ['Marine Biology', 'Conservation', 'Coral Reefs', 'Ecosystem Restoration'],
    isFollowing: true,
    isVerified: true,
    joinedDate: '2017-05-12',
  },
  {
    id: 'author-5',
    name: 'Prof. Elena Volkov',
    username: 'elenavolkov',
    headline: 'Synthetic biology for sustainable manufacturing',
    bio: 'Engineering microorganisms to produce eco-friendly materials and reduce industrial carbon footprint.',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    followerCount: 9100,
    followingCount: 423,
    publicationCount: 94,
    citationCount: 11200,
    hIndex: 35,
    affiliation: 'ETH Zurich',
    expertise: ['Synthetic Biology', 'Biotechnology', 'Sustainability', 'Manufacturing'],
    isFollowing: false,
    isVerified: true,
    joinedDate: '2019-09-03',
  },
  {
    id: 'author-6',
    name: 'Dr. Ahmed Hassan',
    username: 'ahmedhassan',
    headline: 'AI ethics and responsible machine learning',
    bio: 'Researching fairness, accountability, and transparency in AI systems for healthcare and social good.',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    followerCount: 7650,
    followingCount: 334,
    publicationCount: 67,
    citationCount: 9800,
    hIndex: 29,
    affiliation: 'University of Oxford',
    expertise: ['AI Ethics', 'Machine Learning', 'Healthcare AI', 'Fairness'],
    isFollowing: true,
    isVerified: true,
    joinedDate: '2020-02-18',
    coauthoredPapers: [
      {
        title: 'Ethical Frameworks for AI in Healthcare Decision Making',
        year: 2023,
        journal: 'AI Ethics Journal',
      },
    ],
  },
  {
    id: 'author-7',
    name: 'Dr. Lisa Wang',
    username: 'lisawang',
    headline: 'Space medicine and astronaut health research',
    bio: 'Studying the effects of microgravity on human physiology and developing countermeasures for long-duration spaceflight.',
    avatar:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    followerCount: 5430,
    followingCount: 156,
    publicationCount: 43,
    citationCount: 4200,
    hIndex: 22,
    affiliation: 'NASA Johnson Space Center',
    expertise: ['Space Medicine', 'Physiology', 'Microgravity', 'Astronaut Health'],
    isFollowing: false,
    isVerified: true,
    joinedDate: '2021-04-07',
  },
  {
    id: 'author-8',
    name: 'Prof. Robert Kim',
    username: 'robertkim',
    headline: 'Computational neuroscience and brain-computer interfaces',
    bio: 'Developing mathematical models of neural networks and translating them into therapeutic BCIs.',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    followerCount: 10200,
    followingCount: 478,
    publicationCount: 112,
    citationCount: 18700,
    hIndex: 41,
    affiliation: 'Caltech',
    expertise: [
      'Computational Neuroscience',
      'Brain-Computer Interfaces',
      'Neural Networks',
      'Neurotechnology',
    ],
    isFollowing: true,
    isVerified: true,
    joinedDate: '2016-12-14',
    coauthoredPapers: [
      {
        title: 'Neural Network Models for Motor Cortex Decoding',
        year: 2022,
        journal: 'Nature Neuroscience',
      },
      {
        title: 'Real-time Brain-Computer Interface Control Systems',
        year: 2021,
        journal: 'Journal of Neural Engineering',
      },
    ],
  },
  {
    id: 'author-9',
    name: 'Dr. Maria Santos',
    username: 'mariasantos',
    headline: 'Cancer immunotherapy and personalized medicine',
    bio: 'Developing targeted immunotherapies based on patient genetic profiles and tumor microenvironment analysis.',
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    followerCount: 11800,
    followingCount: 392,
    publicationCount: 156,
    citationCount: 28900,
    hIndex: 48,
    affiliation: 'Memorial Sloan Kettering',
    expertise: ['Cancer Research', 'Immunotherapy', 'Personalized Medicine', 'Oncology'],
    isFollowing: false,
    isVerified: true,
    joinedDate: '2015-08-30',
  },
  {
    id: 'author-10',
    name: 'Dr. David Lee',
    username: 'davidlee',
    headline: 'Renewable energy systems and battery technology',
    bio: 'Advancing next-generation battery materials and grid-scale energy storage for renewable integration.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    followerCount: 6950,
    followingCount: 245,
    publicationCount: 85,
    citationCount: 12400,
    hIndex: 33,
    affiliation: 'Stanford Energy Institute',
    expertise: ['Energy Storage', 'Battery Technology', 'Renewable Energy', 'Materials Science'],
    isFollowing: true,
    isVerified: true,
    joinedDate: '2018-01-19',
  },
  {
    id: 'author-11',
    name: 'Dr. Catherine Williams',
    username: 'catherinewilliams',
    headline: 'Biomedical engineering and regenerative medicine',
    bio: 'Developing innovative tissue engineering solutions and biomaterial scaffolds for organ regeneration.',
    avatar:
      'https://images.unsplash.com/photo-1594736797933-d0d0e32df224?w=150&h=150&fit=crop&crop=face',
    followerCount: 8340,
    followingCount: 298,
    publicationCount: 72,
    citationCount: 10300,
    hIndex: 31,
    affiliation: 'Johns Hopkins University',
    expertise: [
      'Biomedical Engineering',
      'Tissue Engineering',
      'Regenerative Medicine',
      'Biomaterials',
    ],
    isFollowing: false,
    isVerified: true,
    joinedDate: '2019-06-15',
  },
];

// Helper functions for filtering and searching
export const searchHubs = (hubs: BrowseHub[], query: string): BrowseHub[] => {
  if (!query.trim()) return hubs;
  const searchTerm = query.toLowerCase();
  return hubs.filter(
    (hub) =>
      hub.name.toLowerCase().includes(searchTerm) ||
      hub.headline.toLowerCase().includes(searchTerm) ||
      hub.description.toLowerCase().includes(searchTerm) ||
      hub.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
};

export const searchAuthors = (authors: BrowseAuthor[], query: string): BrowseAuthor[] => {
  if (!query.trim()) return authors;
  const searchTerm = query.toLowerCase();
  return authors.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm) ||
      author.username.toLowerCase().includes(searchTerm) ||
      author.headline.toLowerCase().includes(searchTerm) ||
      author.bio.toLowerCase().includes(searchTerm) ||
      author.expertise.some((skill) => skill.toLowerCase().includes(searchTerm)) ||
      author.affiliation.toLowerCase().includes(searchTerm)
  );
};

export const filterHubsByType = (
  hubs: BrowseHub[],
  type?: 'journal' | 'community'
): BrowseHub[] => {
  if (!type) return hubs;
  return hubs.filter((hub) => hub.type === type);
};
