export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface FeedCardBase {
  id: string;
  type: 'paper' | 'bounty' | 'proposal' | 'rfp';
  title: string;
  category: string;
  subcategory?: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  comments: number;
  bookmarked: boolean;
  createdDate: string;
  trendingScore?: number;
}

export interface PaperCard extends FeedCardBase {
  type: 'paper';
  authors: Author[];
  abstract: string;
  source: 'arxiv' | 'biorxiv' | 'medrxiv' | 'chemrxiv';
  thumbnails: string[];
  peerReviewScore?: number;
}

export interface BountyCard extends FeedCardBase {
  type: 'bounty';
  authors: Author[];
  bountyAmount: number;
  status: 'open' | 'in-review' | 'closed';
  paper: {
    id: string;
    title: string;
    authors: Author[];
    source: 'arxiv' | 'biorxiv' | 'medrxiv' | 'chemrxiv';
    abstract: string;
  };
  reviewers: { id: number; name: string; avatar: string }[];
}

export interface ProposalCard extends FeedCardBase {
  type: 'proposal';
  authors: Author[];
  institution?: string;
  abstract: string;
  raised: number;
  goal: number;
  endDate: string;
  supporters: { id: number; name: string; avatar: string }[];
  thumbnail?: string;
}

export interface RFPCard extends FeedCardBase {
  type: 'rfp';
  authors: Author[];
  institution?: string;
  budget: number;
  deadline: string;
  applicants: { id: number; name: string; avatar: string }[];
}

export type FeedCard = PaperCard | BountyCard | ProposalCard | RFPCard;

export const mockFeedData: FeedCard[] = [
  {
    id: '1',
    type: 'paper',
    title: 'Demonstrating Fault-Tolerant Logical Qubits in 18 Months',
    category: 'Physics',
    subcategory: 'Quantum Computing',
    authors: [
      { id: 1, firstName: 'Alice', lastName: 'Zhang', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, firstName: 'Bob', lastName: 'Gao', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: 3, firstName: 'Carlos', lastName: 'Diaz', avatar: 'https://i.pravatar.cc/150?img=3' },
    ],
    abstract:
      'We propose an experimental roadmap to achieve sustained logical qubit lifetimes exceeding physical qubits by integrating materials improvements and adaptive decoding algorithms. Our approach combines novel superconducting circuit designs with real-time error correction protocols.',
    source: 'arxiv',
    thumbnails: [
      'https://picsum.photos/seed/quantum1/400/300',
      'https://picsum.photos/seed/quantum2/400/300',
      'https://picsum.photos/seed/quantum3/400/300',
      'https://picsum.photos/seed/quantum4/400/300',
    ],
    upvotes: 494,
    downvotes: 0,
    netVotes: 494,
    comments: 14,
    bookmarked: false,
    createdDate: '14 Oct 2025',
    trendingScore: 69,
  },
  {
    id: '2',
    type: 'bounty',
    title: 'Peer Review Needed: Novel Approach to Cancer Immunotherapy',
    category: 'Medicine',
    subcategory: 'Oncology',
    authors: [
      { id: 4, firstName: 'Diana', lastName: 'Chen', avatar: 'https://i.pravatar.cc/150?img=4' },
      { id: 5, firstName: 'Ethan', lastName: 'Park', avatar: 'https://i.pravatar.cc/150?img=5' },
    ],
    bountyAmount: 5000,
    status: 'open',
    paper: {
      id: '2a',
      title: 'CAR-T Cell Therapy Enhanced by CRISPR-Mediated Gene Editing',
      authors: [
        { id: 4, firstName: 'Diana', lastName: 'Chen', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: 5, firstName: 'Ethan', lastName: 'Park', avatar: 'https://i.pravatar.cc/150?img=5' },
      ],
      source: 'biorxiv',
      abstract:
        'We demonstrate a novel CAR-T cell therapy approach that combines CRISPR gene editing to enhance tumor recognition and reduce immune escape mechanisms in solid tumors.',
    },
    reviewers: [
      { id: 6, name: 'Dr. Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=6' },
      { id: 7, name: 'Dr. Michael Kim', avatar: 'https://i.pravatar.cc/150?img=7' },
      { id: 8, name: 'Dr. Lisa Wang', avatar: 'https://i.pravatar.cc/150?img=8' },
    ],
    upvotes: 234,
    downvotes: 5,
    netVotes: 229,
    comments: 45,
    bookmarked: true,
    createdDate: '12 Oct 2025',
    trendingScore: 82,
  },
  {
    id: '3',
    type: 'proposal',
    title: 'Long-term Climate Effects of Ocean Iron Fertilization',
    category: 'Climate Science',
    authors: [
      { id: 9, firstName: 'Frank', lastName: 'Martinez', avatar: 'https://i.pravatar.cc/150?img=9' },
      {
        id: 10,
        firstName: 'Grace',
        lastName: 'Thompson',
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
      { id: 11, firstName: 'Henry', lastName: 'Lee', avatar: 'https://i.pravatar.cc/150?img=11' },
    ],
    institution: 'Ocean Research Institute',
    abstract:
      'This study proposes a comprehensive 5-year field experiment to assess the efficacy and ecological impacts of ocean iron fertilization as a carbon sequestration strategy. We will monitor phytoplankton blooms, carbon export, and ecosystem responses across multiple oceanic regions.',
    raised: 42000,
    goal: 100000,
    endDate: '30 Dec 2025',
    supporters: [
      { id: 12, name: 'Climate Foundation', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 13, name: 'Ocean Research Institute', avatar: 'https://i.pravatar.cc/150?img=13' },
      { id: 14, name: 'Dr. Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=14' },
      { id: 15, name: 'Green Tech Ventures', avatar: 'https://i.pravatar.cc/150?img=15' },
      { id: 16, name: 'Dr. James Rodriguez', avatar: 'https://i.pravatar.cc/150?img=16' },
      { id: 17, name: 'Marine Conservation Fund', avatar: 'https://i.pravatar.cc/150?img=17' },
    ],
    thumbnail: 'https://picsum.photos/seed/ocean1/400/300',
    upvotes: 312,
    downvotes: 18,
    netVotes: 294,
    comments: 67,
    bookmarked: false,
    createdDate: '10 Oct 2025',
    trendingScore: 75,
  },
  {
    id: '4',
    type: 'rfp',
    title: 'Advanced Materials for Next-Generation Battery Technology',
    category: 'Materials Science',
    authors: [
      { id: 40, firstName: 'Jennifer', lastName: 'Wilson', avatar: 'https://i.pravatar.cc/150?img=40' },
      { id: 41, firstName: 'Robert', lastName: 'Chen', avatar: 'https://i.pravatar.cc/150?img=41' },
    ],
    institution: 'Department of Energy',
    budget: 2500000,
    deadline: '30 Nov 2025',
    applicants: [
      { id: 18, name: 'Dr. Sophie Anderson', avatar: 'https://i.pravatar.cc/150?img=18' },
      { id: 19, name: 'Prof. David Kumar', avatar: 'https://i.pravatar.cc/150?img=19' },
      { id: 20, name: 'Dr. Rachel Cohen', avatar: 'https://i.pravatar.cc/150?img=20' },
      { id: 21, name: 'Prof. Thomas Wright', avatar: 'https://i.pravatar.cc/150?img=21' },
      { id: 22, name: 'Dr. Maria Garcia', avatar: 'https://i.pravatar.cc/150?img=22' },
      { id: 23, name: 'Dr. Kevin Nguyen', avatar: 'https://i.pravatar.cc/150?img=23' },
    ],
    upvotes: 421,
    downvotes: 12,
    netVotes: 409,
    comments: 89,
    bookmarked: true,
    createdDate: '08 Oct 2025',
    trendingScore: 88,
  },
  {
    id: '5',
    type: 'paper',
    title: 'Non-Invasive Brain-Computer Interfaces for Restoring Motor Function in Paralysis Patients',
    category: 'Neuroscience',
    subcategory: 'Brain-Computer Interfaces',
    authors: [
      { id: 24, firstName: 'Lisa', lastName: 'Anderson', avatar: 'https://i.pravatar.cc/150?img=24' },
      { id: 25, firstName: 'Jane', lastName: 'Smith', avatar: 'https://i.pravatar.cc/150?img=25' },
      { id: 26, firstName: 'Robert', lastName: 'Johnson', avatar: 'https://i.pravatar.cc/150?img=26' },
    ],
    abstract:
      'We present a novel non-invasive brain-computer interface system that enables paralysis patients to control robotic limbs through neural signal processing. Our approach combines advanced machine learning algorithms with high-resolution EEG sensors to decode motor intentions with unprecedented accuracy.',
    source: 'biorxiv',
    thumbnails: [
      'https://picsum.photos/seed/brain1/400/300',
      'https://picsum.photos/seed/brain2/400/300',
      'https://picsum.photos/seed/brain3/400/300',
      'https://picsum.photos/seed/brain4/400/300',
    ],
    upvotes: 567,
    downvotes: 8,
    netVotes: 559,
    comments: 0,
    bookmarked: false,
    createdDate: '12 Oct 2025',
    peerReviewScore: 4.8,
  },
  {
    id: '6',
    type: 'paper',
    title: 'Machine Learning Approaches to Predicting Protein Folding Dynamics',
    category: 'Bioinformatics',
    subcategory: 'Computational Biology',
    authors: [
      { id: 27, firstName: 'Robert', lastName: 'Johnson', avatar: 'https://i.pravatar.cc/150?img=27' },
      { id: 28, firstName: 'Biao', lastName: 'Yuan', avatar: 'https://i.pravatar.cc/150?img=28' },
      { id: 29, firstName: 'Zeyu', lastName: 'Wang', avatar: 'https://i.pravatar.cc/150?img=29' },
    ],
    abstract:
      'This paper introduces a transformer-based neural network architecture for predicting protein folding pathways and intermediate states. Our model achieves state-of-the-art accuracy on benchmark datasets and provides mechanistic insights into the folding process.',
    source: 'arxiv',
    thumbnails: [
      'https://picsum.photos/seed/protein1/400/300',
      'https://picsum.photos/seed/protein2/400/300',
      'https://picsum.photos/seed/protein3/400/300',
      'https://picsum.photos/seed/protein4/400/300',
    ],
    upvotes: 494,
    downvotes: 0,
    netVotes: 494,
    comments: 67,
    bookmarked: false,
    createdDate: '28 Oct 2025',
    trendingScore: 91,
  },
  {
    id: '7',
    type: 'proposal',
    title: 'Developing Drought-Resistant Crop Varieties Using CRISPR',
    category: 'Agriculture',
    subcategory: 'Plant Genetics',
    authors: [
      { id: 30, firstName: 'Samantha', lastName: 'Brown', avatar: 'https://i.pravatar.cc/150?img=30' },
      { id: 31, firstName: 'Michael', lastName: 'Davis', avatar: 'https://i.pravatar.cc/150?img=31' },
    ],
    institution: 'Agricultural Research Institute',
    abstract:
      'We propose to develop drought-resistant wheat and rice varieties using CRISPR-Cas9 gene editing technology. Our approach targets key stress response genes to enhance water use efficiency while maintaining yield performance.',
    raised: 75000,
    goal: 100000,
    endDate: '15 Dec 2025',
    supporters: [
      { id: 32, name: 'Agricultural Research Fund', avatar: 'https://i.pravatar.cc/150?img=32' },
      { id: 33, name: 'Dr. Laura Mitchell', avatar: 'https://i.pravatar.cc/150?img=33' },
      { id: 34, name: 'Climate Adaptation Institute', avatar: 'https://i.pravatar.cc/150?img=34' },
      { id: 35, name: 'Prof. Andrew Taylor', avatar: 'https://i.pravatar.cc/150?img=35' },
      { id: 36, name: 'Sustainable Agriculture Alliance', avatar: 'https://i.pravatar.cc/150?img=36' },
    ],
    thumbnail: 'https://picsum.photos/seed/crop1/400/300',
    upvotes: 389,
    downvotes: 21,
    netVotes: 368,
    comments: 52,
    bookmarked: true,
    createdDate: '06 Oct 2025',
    trendingScore: 71,
  },
];

export const followingTopics = [
  'Biology',
  'Quantum Physics',
  'Machine Learning',
  'Genetics',
  'Climate Science',
  'Neuroscience',
  'Chemistry',
];

