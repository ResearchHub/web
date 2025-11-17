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
  engagedUsers?: { id: number; name: string; avatar: string }[];
  peerReviewCount?: number;
  peerReviewAverage?: number;
}

export interface PaperCard extends FeedCardBase {
  type: 'paper';
  authors: Author[];
  abstract: string;
  source: 'arxiv' | 'biorxiv' | 'medrxiv' | 'chemrxiv';
  thumbnails: string[];
  peerReviewScore?: number;
  heroImage?: string;
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
      'Quantum error correction is essential for building practical quantum computers capable of running algorithms beyond the reach of classical machines. While theoretical frameworks for fault-tolerant quantum computation have been established for decades, experimental demonstration of logical qubits with lifetimes exceeding those of their constituent physical qubits remains a critical milestone. In this work, we propose a comprehensive experimental roadmap to achieve sustained logical qubit lifetimes exceeding physical qubits by integrating materials improvements and adaptive decoding algorithms. Our approach combines novel superconducting circuit designs with real-time error correction protocols. We begin by analyzing the primary sources of errors in current superconducting qubit architectures, including T1 relaxation, T2 dephasing, and gate errors. Through systematic materials engineering and optimized fabrication processes, we demonstrate pathways to reduce these error rates by an order of magnitude. Our proposed architecture employs a surface code implementation with a threshold error rate of 1%, which we show is achievable with current technology roadmaps. We present detailed simulations of the error correction performance under realistic noise models, incorporating correlated errors, measurement errors, and leakage to non-computational states. Furthermore, we introduce adaptive decoding strategies that leverage machine learning techniques to optimize error correction in real-time based on the observed error patterns. These adaptive decoders show significant improvements over static decoding schemes, particularly in the presence of time-varying noise sources. We outline a staged experimental program spanning 18 months, with clearly defined milestones and success criteria at each stage. The first phase focuses on demonstrating break-even performance where logical qubit lifetime equals physical qubit lifetime. The second phase targets a factor of 2-3 improvement in logical qubit coherence. The final phase aims for an order of magnitude improvement, enabling the execution of meaningful quantum algorithms with error rates below the fault-tolerance threshold. Our work provides a realistic timeline and technical roadmap for achieving fault-tolerant quantum computation, a critical step toward practical quantum computers.',
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
    peerReviewScore: 4.3,
    peerReviewAverage: 3.7,
    peerReviewCount: 12,
    engagedUsers: [
      { id: 50, name: 'Dr. Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?img=50' },
      { id: 51, name: 'Prof. James Wilson', avatar: 'https://i.pravatar.cc/150?img=51' },
      { id: 52, name: 'Dr. Emma Brown', avatar: 'https://i.pravatar.cc/150?img=52' },
      { id: 53, name: 'Dr. Michael Chen', avatar: 'https://i.pravatar.cc/150?img=53' },
      { id: 54, name: 'Dr. Laura Davis', avatar: 'https://i.pravatar.cc/150?img=54' },
    ],
  },
  {
    id: '2',
    type: 'paper',
    title: 'CAR-T Cell Therapy Enhanced by CRISPR-Mediated Gene Editing',
    category: 'Medicine',
    subcategory: 'Oncology',
    authors: [
      { id: 4, firstName: 'Diana', lastName: 'Chen', avatar: 'https://i.pravatar.cc/150?img=27' },
      { id: 5, firstName: 'Ethan', lastName: 'Park', avatar: 'https://i.pravatar.cc/150?img=28' },
      { id: 6, firstName: 'Marcus', lastName: 'Liu', avatar: 'https://i.pravatar.cc/150?img=29' },
    ],
    abstract:
      'Chimeric antigen receptor T-cell (CAR-T) therapy has revolutionized the treatment of hematologic malignancies, but its efficacy against solid tumors remains limited. We demonstrate a novel CAR-T cell therapy approach that combines CRISPR-Cas9 gene editing to enhance tumor recognition and reduce immune escape mechanisms in solid tumors. Our strategy involves multiplex editing to simultaneously knockout inhibitory receptors, insert enhanced CAR constructs, and fortify T-cell persistence. In preclinical models of pancreatic and ovarian cancer, our CRISPR-enhanced CAR-T cells showed 10-fold greater tumor infiltration and a 70% complete response rate compared to conventional CAR-T therapy.',
    source: 'biorxiv',
    thumbnails: [
      'https://picsum.photos/seed/cart1/400/300',
      'https://picsum.photos/seed/cart2/400/300',
      'https://picsum.photos/seed/cart3/400/300',
      'https://picsum.photos/seed/cart4/400/300',
    ],
    upvotes: 234,
    downvotes: 5,
    netVotes: 229,
    comments: 45,
    bookmarked: true,
    createdDate: '12 Oct 2025',
    trendingScore: 82,
    peerReviewScore: 4.6,
    peerReviewAverage: 4.2,
    peerReviewCount: 8,
    engagedUsers: [
      // { id: 7, name: 'Dr. Anna Rodriguez', avatar: 'https://i.pravatar.cc/150?img=60' },
      // { id: 8, name: 'Prof. Thomas Lee', avatar: 'https://i.pravatar.cc/150?img=61' },
      // { id: 9, name: 'Dr. Rebecca Taylor', avatar: 'https://i.pravatar.cc/150?img=62' },
    ],
  },
  {
    id: '3',
    type: 'paper',
    title: 'Long-term Climate Effects of Ocean Iron Fertilization on Marine Ecosystems',
    category: 'Climate Science',
    subcategory: 'Marine Biology',
    authors: [
      {
        id: 9,
        firstName: 'Frank',
        lastName: 'Martinez',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
      {
        id: 10,
        firstName: 'Grace',
        lastName: 'Thompson',
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
      { id: 11, firstName: 'Henry', lastName: 'Lee', avatar: 'https://i.pravatar.cc/150?img=11' },
    ],
    abstract:
      'Ocean iron fertilization has been proposed as a large-scale geoengineering approach to sequester atmospheric CO2 by stimulating phytoplankton growth in iron-limited regions. However, comprehensive assessments of its long-term ecological impacts remain scarce. This study presents results from a 10-year monitoring program following controlled iron fertilization experiments in the Southern Ocean. We demonstrate significant increases in primary productivity and carbon export to deep waters, with approximately 0.3 gigatons of CO2 sequestered per fertilization event. However, our findings reveal concerning shifts in marine biodiversity, including harmful algal bloom formation, disruption of zooplankton communities, and altered nutrient cycling patterns that persisted for years post-fertilization.',
    source: 'medrxiv',
    thumbnails: [
      'https://picsum.photos/seed/ocean1/400/300',
      'https://picsum.photos/seed/ocean2/400/300',
      'https://picsum.photos/seed/ocean3/400/300',
      'https://picsum.photos/seed/ocean4/400/300',
    ],
    upvotes: 312,
    downvotes: 18,
    netVotes: 294,
    comments: 67,
    bookmarked: false,
    createdDate: '10 Oct 2025',
    trendingScore: 75,
    peerReviewScore: 4.1,
    peerReviewAverage: 3.9,
    peerReviewCount: 15,
    heroImage:
      'https://www.science.org/cms/10.1126/science.aba7365/asset/583ab5ee-ea0f-4f3d-b3b0-b208437b5c56/assets/graphic/367_aba7365_fa.jpeg',
    engagedUsers: [
      { id: 71, name: 'Dr. Ocean Martinez', avatar: 'https://i.pravatar.cc/150?img=71' },
      { id: 72, name: 'Prof. Climate Jones', avatar: 'https://i.pravatar.cc/150?img=72' },
    ],
  },
  {
    id: '4',
    type: 'paper',
    title: 'Advanced Solid-State Electrolytes for Next-Generation Battery Technology',
    category: 'Materials Science',
    subcategory: 'Energy Storage',
    authors: [
      {
        id: 40,
        firstName: 'Jennifer',
        lastName: 'Wilson',
        avatar: 'https://i.pravatar.cc/150?img=40',
      },
      { id: 41, firstName: 'Robert', lastName: 'Chen', avatar: 'https://i.pravatar.cc/150?img=41' },
      {
        id: 73,
        firstName: 'Elena',
        lastName: 'Petrov',
        avatar: 'https://i.pravatar.cc/150?img=73',
      },
    ],
    abstract:
      'Solid-state batteries represent a transformative advancement in energy storage technology, offering enhanced safety, energy density, and longevity compared to conventional lithium-ion batteries. The key challenge lies in developing solid electrolytes that combine high ionic conductivity, chemical stability, and compatibility with electrode materials. We report the synthesis and characterization of a novel sulfide-based solid electrolyte with room-temperature ionic conductivity exceeding 25 mS/cm, approaching that of liquid electrolytes. Our material demonstrates exceptional electrochemical stability across a 0-5V window and maintains structural integrity through 2000+ charge-discharge cycles. We present comprehensive mechanistic studies revealing the role of dopant chemistry in enhancing lithium-ion mobility while suppressing dendrite formation. storage technology, offering enhanced safety, energy density, and longevity compared to conventional lithium-ion batteries. The key challenge lies in developing solid electrolytes that combine high ionic conductivity, chemical stability, and compatibility with electrode materials. We report the synthesis and characterization of a novel sulfide-based solid electrolyte with room-temperature ionic conductivity exceeding 25 mS/cm, approaching that of liquid electrolytes. Our material demonstrates exceptional electrochemical stability across a 0-5V window and maintains structural integrity through 2000+ charge-discharge cycles. We present comprehensive mechanistic studies revealing the role of dopant chemistry in enhancing lithium-ion mobility while suppressing dendrite formation',
    source: 'chemrxiv',
    thumbnails: [
      'https://picsum.photos/seed/battery1/400/300',
      'https://picsum.photos/seed/battery2/400/300',
      'https://picsum.photos/seed/battery3/400/300',
      'https://picsum.photos/seed/battery4/400/300',
    ],
    upvotes: 421,
    downvotes: 12,
    netVotes: 409,
    comments: 89,
    bookmarked: true,
    createdDate: '08 Oct 2025',
    trendingScore: 88,
    peerReviewScore: 4.7,
    peerReviewAverage: 4.5,
    peerReviewCount: 6,
    heroImage:
      'https://pub.mdpi-res.com/batteries/batteries-10-00454/article_deploy/html/images/batteries-10-00454-g005.png?1735031205',
    engagedUsers: [
      { id: 62, name: 'Dr. Olivia Thompson', avatar: 'https://i.pravatar.cc/150?img=62' },
      { id: 64, name: 'Prof. Sophia Harris', avatar: 'https://i.pravatar.cc/150?img=64' },
      { id: 65, name: 'Dr. Ryan Clark', avatar: 'https://i.pravatar.cc/150?img=65' },
      { id: 66, name: 'Dr. Isabella Lewis', avatar: 'https://i.pravatar.cc/150?img=66' },
    ],
  },
  {
    id: '5',
    type: 'paper',
    title:
      'Non-Invasive Brain-Computer Interfaces for Restoring Motor Function in Paralysis Patients',
    category: 'Neuroscience',
    subcategory: 'Brain-Computer Interfaces',
    authors: [
      {
        id: 24,
        firstName: 'Lisa',
        lastName: 'Anderson',
        avatar: 'https://i.pravatar.cc/150?img=24',
      },
      { id: 25, firstName: 'Jane', lastName: 'Smith', avatar: 'https://i.pravatar.cc/150?img=25' },
      {
        id: 26,
        firstName: 'Robert',
        lastName: 'Johnson',
        avatar: 'https://i.pravatar.cc/150?img=26',
      },
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
    peerReviewAverage: 3.8,
    peerReviewCount: 10,
    engagedUsers: [
      { id: 58, name: 'Dr. Christopher Adams', avatar: 'https://i.pravatar.cc/150?img=58' },
      { id: 59, name: 'Prof. Jennifer White', avatar: 'https://i.pravatar.cc/150?img=59' },
    ],
  },
  {
    id: '6',
    type: 'paper',
    title: 'Machine Learning Approaches to Predicting Protein Folding Dynamics',
    category: 'Bioinformatics',
    subcategory: 'Computational Biology',
    authors: [
      {
        id: 27,
        firstName: 'Robert',
        lastName: 'Johnson',
        avatar: 'https://i.pravatar.cc/150?img=27',
      },
      { id: 28, firstName: 'Biao', lastName: 'Yuan', avatar: 'https://i.pravatar.cc/150?img=28' },
      { id: 29, firstName: 'Zeyu', lastName: 'Wang', avatar: 'https://i.pravatar.cc/150?img=29' },
    ],
    abstract:
      'This paper introduces a transformer-based neural network architecture for predicting protein folding pathways and intermediate states. Our model achieves state-of-the-art accuracy on benchmark datasets and provides mechanistic insights into the folding process. neural network architecture for predicting protein folding pathways and intermediate states. Our model achieves state-of-the-art accuracy on benchmark datasets and provides mechanistic insights into the folding process. neural network architecture for predicting protein folding pathways and intermediate states. Our model achieves state-of-the-art accuracy on benchmark datasets and provides mechanistic insights into the folding process.',
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
    peerReviewScore: 3.7,
    heroImage: 'https://wp.technologyreview.com/wp-content/uploads/2021/10/protein2.jpg?w=1200',
    engagedUsers: [
      { id: 60, name: 'Dr. Patricia Moore', avatar: 'https://i.pravatar.cc/150?img=60' },
      { id: 61, name: 'Prof. Daniel Martinez', avatar: 'https://i.pravatar.cc/150?img=61' },
      { id: 62, name: 'Dr. Olivia Thompson', avatar: 'https://i.pravatar.cc/150?img=62' },
      { id: 63, name: 'Dr. Andrew Jackson', avatar: 'https://i.pravatar.cc/150?img=63' },
      { id: 64, name: 'Prof. Sophia Harris', avatar: 'https://i.pravatar.cc/150?img=64' },
      { id: 65, name: 'Dr. Ryan Clark', avatar: 'https://i.pravatar.cc/150?img=65' },
      { id: 66, name: 'Dr. Isabella Lewis', avatar: 'https://i.pravatar.cc/150?img=66' },
    ],
  },
  {
    id: '7',
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
      id: '7a',
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
    engagedUsers: [
      { id: 55, name: 'Dr. Anna Rodriguez', avatar: 'https://i.pravatar.cc/150?img=55' },
      { id: 56, name: 'Prof. Thomas Lee', avatar: 'https://i.pravatar.cc/150?img=56' },
      { id: 57, name: 'Dr. Rebecca Taylor', avatar: 'https://i.pravatar.cc/150?img=57' },
    ],
  },
  {
    id: '8',
    type: 'proposal',
    title: 'Long-term Climate Effects of Ocean Iron Fertilization',
    category: 'Climate Science',
    authors: [
      {
        id: 9,
        firstName: 'Frank',
        lastName: 'Martinez',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
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
    id: '10',
    type: 'proposal',
    title: 'Developing Drought-Resistant Crop Varieties Using CRISPR',
    category: 'Agriculture',
    subcategory: 'Plant Genetics',
    authors: [
      {
        id: 30,
        firstName: 'Samantha',
        lastName: 'Brown',
        avatar: 'https://i.pravatar.cc/150?img=30',
      },
      {
        id: 31,
        firstName: 'Michael',
        lastName: 'Davis',
        avatar: 'https://i.pravatar.cc/150?img=31',
      },
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
      {
        id: 36,
        name: 'Sustainable Agriculture Alliance',
        avatar: 'https://i.pravatar.cc/150?img=36',
      },
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
  {
    id: '9',
    type: 'rfp',
    title: 'Advanced Materials for Next-Generation Battery Technology',
    category: 'Materials Science',
    authors: [
      {
        id: 40,
        firstName: 'Jennifer',
        lastName: 'Wilson',
        avatar: 'https://i.pravatar.cc/150?img=40',
      },
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
];

export const followingTopics = [
  'Energy Storage',
  'Machine Learning',
  'Computational Biology',
  // 'Climate Science',
  // 'Neuroscience',
  'Chemistry',
];
