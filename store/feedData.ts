import { FeedEntry, User, Hub } from '@/types/feed';



const users: Record<string, User> = {
  researchHub: {
    id: 'rhub-001',
    fullName: 'ResearchHub Foundation',
    verified: true,
    isOrganization: true,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/20/blob",
  },
  dominikus: {
    id: 'dom-001',
    fullName: 'Dominikus Brian',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/19/blob",
  },
  bioRxiv: {
    id: 'biorxiv-001',
    fullName: 'bioRxiv (Cold Spring Harbor Laboratory)',
    verified: true,
    isOrganization: true,
    isVerified: true,
    profileImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh0mIPhY2F4yEhtpWJERf0sCvfaPwyUieCkVfg6aS8acUqZ7f5v21HNlFxEtHmtCQYFSXdX97Y7HiZd7pedBXfL2oTlj1NnaEwpwWQKXOLHwt7tp18djNgKdF3sKNE8bhIrTUiE/s0/lwyH1HFe_400x400.jpg",
  },
  adamDraper: {
    id: 'adam-001',
    fullName: 'Adam Draper',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/27/blob_yxyA3Mo'
  },
  elenaRodriguez: {
    id: 'elena-001',
    fullName: 'Dr. Elena Rodriguez',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/18/blob_MRP9Qf6'
  },
  hundessaNemomssa: {
    id: 'hundessa-001',
    fullName: 'Hundessa Nemomssa',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://lh3.googleusercontent.com/a/ACg8ocJj0QP51OML0cy6qsoKezhVqHB96qVEBEMtlWY2Jhc8xWvWIjY=s96-c",
  },
  alexThompson: {
    id: 'alex-001',
    fullName: 'Alex Thompson',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/17/blob_mXZ6zDF",
  },
  sarahChen: {
    id: 'sarah-001',
    fullName: 'Sarah Chen',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/25/blob_7T1yCOe",
  },
  mariaGarcia: {
    id: 'maria-001',
    fullName: 'Maria Garcia',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/17/blob_F2VhiHh",
  },
  davidKumar: {
    id: 'david-001',
    fullName: 'David Kumar',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://lh3.googleusercontent.com/a-/AOh14GiRKX1-3CxehVa8k35yT8n3E3kUUctMHuWEGhoJ6A=s96-c",
  },
  jamesWilson: {
    id: 'james-001',
    fullName: 'James Wilson',
    verified: false,
    isOrganization: false,
    isVerified: false,
    profileImage: "https://lh3.googleusercontent.com/a/ACg8ocIi10fNj-bjJh_6tKyaZ1PeC-hTcVvlHSMYLK-5LjXvuwmhpMxY=s96-c",
  },
  mariaPatel: {
    id: 'maria-002',
    fullName: 'Maria Patel',
    verified: true,
    isOrganization: false,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2024/11/13/blob_eu0M5yn",
  },
  stanfordAILab: {
    id: 'stanford-001',
    fullName: 'Stanford AI Lab',
    verified: true,
    isOrganization: true,
    isVerified: true,
    profileImage: "https://pbs.twimg.com/profile_images/875395483128049664/8z_jvdLB_400x400.jpg",
  },
  climateResearchInstitute: {
    id: 'climate-001',
    fullName: 'Climate Research Institute',
    verified: true,
    isOrganization: true,
    isVerified: true,
    profileImage: "https://storage.prod.researchhub.com/uploads/author_profile_images/2023/09/16/blob",
  },
  openBiologyInitiative: {
    id: 'obi-001',
    fullName: 'Open Biology Initiative',
    verified: true,
    isOrganization: true,
    isVerified: true,
    profileImage: "https://cdn-icons-png.flaticon.com/256/525/525916.png",
  },
  nationalScienceFoundation: {
    id: 'nsf-001',
    fullName: 'National Science Foundation',
    verified: true,
    isOrganization: true,
    isVerified: true,
    profileImage: "https://pbs.twimg.com/profile_images/1476237803763773447/bL1_CQLe_400x400.jpg"
  }
};

const hubs: Record<string, Hub> = {
  researchMethods: {
    name: 'Research Methods',
    slug: 'research-methods'
  },
  neuroscience: {
    name: 'Neuroscience',
    slug: 'neuroscience'
  },
  molecularBiology: {
    name: 'Molecular Biology',
    slug: 'molecular-biology'
  },
  environmentalScience: {
    name: 'Environmental Science',
    slug: 'environmental-science'
  },
  medicalDevices: {
    name: 'Medical Devices',
    slug: 'medical-devices'
  },
  dataScience: {
    name: 'Data Science',
    slug: 'data-science'
  },
  quantumComputing: {
    name: 'Quantum Computing',
    slug: 'quantum-computing'
  },
  genetics: {
    name: 'Genetics',
    slug: 'genetics'
  },
  artificialIntelligence: {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence'
  },
  climateScience: {
    name: 'Climate Science',
    slug: 'climate-science'
  },
  biology: {
    name: 'Biology',
    slug: 'biology'
  }
};

export const feedEntries: FeedEntry[] = [
  {
    id: 'feed-1',
    action: 'publish',
    actor: users.bioRxiv,
    timestamp: 'Oct 18, 2024',
    item: {
      id: 'item-1',
      type: 'paper',
      title: "Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity",
      description: "Deoxysphingolipids (doxSLs) are atypical sphingolipids that accumulate in HSAN1 and diabetic neuropathy...",
      user: users.bioRxiv,
      timestamp: 'Oct 18, 2024',
      hub: hubs.molecularBiology,
      metrics: {
        votes: 8,
        comments: 12
      },
      authors: [
        { name: "Suchandrima Saha", verified: true },
        { name: "Fabiola Velázquez", verified: false },
        { name: "David Montrose", verified: true }
      ],
      doi: "10.1101/2024.10.16.618749",
      journal: "bioRxiv (Cold Spring Harbor Laboratory)"
    }
  },
  {
    id: 'feed-2',
    action: 'post',
    actor: users.dominikus,
    timestamp: 'Oct 9, 2024',
    item: {
      id: 'item-2',
      type: 'funding_request',
      title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
      description: 'Research project exploring the impact of incentive structures on peer review quality and participation.',
      user: users.dominikus,
      timestamp: 'Oct 9, 2024',
      hub: hubs.researchMethods,
      metrics: {
        votes: 45,
        comments: 21,
        contributors: 6
      },
      amount: 30131,
      goalAmount: 36389,
      progress: 85
    }
  },
  {
    id: 'feed-3',
    action: 'post',
    actor: users.researchHub,
    timestamp: '1h ago',
    item: {
      id: 'item-3',
      type: 'reward',
      title: 'Peer Review: Neural Mechanisms of Memory Formation',
      description: 'Review this manuscript investigating novel pathways in hippocampal memory consolidation using optogenetics and calcium imaging.',
      user: users.researchHub,
      timestamp: '1h ago',
      hub: hubs.neuroscience,
      metrics: {
        votes: 15,
        comments: 4
      },
      amount: '500',
      deadline: '3 days',
      difficulty: 'Advanced'
    }
  },
  {
    id: 'feed-4',
    action: 'post',
    actor: users.adamDraper,
    timestamp: '1h ago',
    item: {
      id: 'item-4',
      type: 'grant',
      title: 'Urban Water Quality Assessment: A Multi-City Analysis of Municipal Water Systems Across America',
      description: 'Seeking researchers to conduct comprehensive water quality analysis in developing regions.',
      user: users.adamDraper,
      timestamp: '1h ago',
      hub: hubs.environmentalScience,
      metrics: {
        votes: 32,
        comments: 12,
        contributors: 15,
        applicants: 8
      },
      amount: '500,000'
    }
  },
  {
    id: 'feed-5',
    action: 'review',
    actor: users.elenaRodriguez,
    timestamp: '2h ago',
    item: {
      id: 'item-5',
      type: 'review',
      title: 'Review of "Revolutionizing Patient Care: Advances in Flexible Printed Heaters"',
      description: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      user: users.elenaRodriguez,
      timestamp: '2h ago',
      hub: hubs.medicalDevices,
      metrics: {
        votes: 12,
        comments: 3,
        reviewScore: 4
      },
      amount: 150
    }
  },
  {
    id: 'feed-6',
    action: 'publish',
    actor: users.hundessaNemomssa,
    timestamp: '4h ago',
    item: {
      id: 'item-6',
      type: 'paper',
      title: 'Revolutionizing Patient Care: A Comprehensive Review',
      description: 'New preprint exploring recent developments in flexible printed heaters for medical devices.',
      user: users.hundessaNemomssa,
      timestamp: '4h ago',
      hub: hubs.medicalDevices,
      metrics: {
        votes: 24,
        comments: 7
      },
      authors: [
        { name: "John Doe", verified: true },
        { name: "Jane Smith", verified: false }
      ],
      doi: "10.1101/2024.10.16.618750",
      journal: "Journal of Medical Devices"
    }
  },
  {
    id: 'feed-7',
    action: 'contribute',
    actor: users.alexThompson,
    timestamp: '15m ago',
    item: {
      id: 'item-7',
      type: 'contribution',
      title: 'Contribution to Neurodegenerative Disease Research',
      description: 'Contributed to funding request for early detection of neurodegenerative diseases.',
      user: users.alexThompson,
      timestamp: '15m ago',
      hub: hubs.neuroscience,
      metrics: {
        votes: 12,
        comments: 3
      },
      amount: 500
    },
    relatedItem: {
      id: 'item-8',
      type: 'funding_request',
      title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
      description: 'Developing AI models to identify early biomarkers of neurodegeneration using multi-modal medical imaging data.',
      user: users.sarahChen,
      timestamp: '3h ago',
      hub: hubs.neuroscience,
      metrics: {
        votes: 28,
        comments: 15,
        contributors: 4
      },
      amount: 45000,
      goalAmount: 75000,
      progress: 60
    }
  },
  {
    id: 'feed-8',
    action: 'contribute',
    actor: users.mariaGarcia,
    timestamp: '45m ago',
    item: {
      id: 'item-9',
      type: 'contribution',
      title: 'Contribution to COVID-19 Vaccination Efficacy Data Analysis',
      description: 'Contributed to reward for statistical analysis of COVID-19 vaccination efficacy data.',
      user: users.mariaGarcia,
      timestamp: '45m ago',
      hub: hubs.dataScience,
      metrics: {
        votes: 8,
        comments: 5
      },
      amount: 750
    },
    relatedItem: {
      id: 'item-10',
      type: 'reward',
      title: 'Statistical Analysis of COVID-19 Vaccination Efficacy Data',
      description: 'Analyze vaccination efficacy data to provide insights into vaccine performance.',
      user: users.researchHub,
      timestamp: '2d ago',
      hub: hubs.dataScience,
      metrics: {
        votes: 20,
        comments: 10,
        contributors: 3
      },
      amount: '2,000',
      deadline: '5 days',
      difficulty: 'Intermediate'
    }
  },
  {
    id: 'marketplace-1',
    action: 'post',
    actor: users.sarahChen,
    timestamp: '3h ago',
    item: {
      id: 'item-11',
      type: 'funding_request',
      title: 'ML for Early Detection of Neurodegenerative Diseases',
      description: 'Developing AI models to identify early biomarkers of neurodegeneration.',
      user: users.sarahChen,
      timestamp: '3h ago',
      hub: hubs.neuroscience,
      metrics: {
        votes: 28,
        comments: 15,
        contributors: 4
      },
      amount: 45000,
      goalAmount: 75000,
      progress: 60
    }
  },
  {
    id: 'marketplace-2',
    action: 'post',
    actor: users.davidKumar,
    timestamp: '1d ago',
    item: {
      id: 'item-12',
      type: 'funding_request',
      title: 'Sustainable Battery Materials Research',
      description: 'Investigating novel eco-friendly materials for next-generation battery technology with improved efficiency.',
      user: users.davidKumar,
      timestamp: '1d ago',
      hub: hubs.environmentalScience,
      metrics: {
        votes: 45,
        comments: 23,
        contributors: 8
      },
      amount: 12000,
      goalAmount: 50000,
      progress: 24
    }
  },
  {
    id: 'marketplace-3',
    action: 'post',
    actor: users.elenaRodriguez,
    timestamp: '2d ago',
    item: {
      id: 'item-13',
      type: 'funding_request',
      title: 'CRISPR Gene Therapy for Rare Diseases',
      description: 'Developing targeted gene therapy approaches for treating rare genetic disorders using CRISPR-Cas9.',
      user: users.elenaRodriguez,
      timestamp: '2d ago',
      hub: hubs.genetics,
      metrics: {
        votes: 156,
        comments: 42,
        contributors: 23
      },
      amount: 95000,
      goalAmount: 100000,
      progress: 95
    }
  },
  {
    id: 'marketplace-4',
    action: 'post',
    actor: users.jamesWilson,
    timestamp: '4d ago',
    item: {
      id: 'item-14',
      type: 'funding_request',
      title: 'Urban Air Quality Monitoring Network',
      description: 'Creating a network of low-cost air quality sensors for real-time urban pollution monitoring and analysis.',
      user: users.jamesWilson,
      timestamp: '4d ago',
      hub: hubs.environmentalScience,
      metrics: {
        votes: 12,
        comments: 8,
        contributors: 5
      },
      amount: 3500,
      goalAmount: 15000,
      progress: 23
    }
  },
  {
    id: 'marketplace-5',
    action: 'post',
    actor: users.mariaPatel,
    timestamp: '5d ago',
    item: {
      id: 'item-15',
      type: 'funding_request',
      title: 'Quantum Computing Algorithm Development',
      description: 'Research into novel quantum algorithms for optimization problems in computational chemistry.',
      user: users.mariaPatel,
      timestamp: '5d ago',
      hub: hubs.quantumComputing,
      metrics: {
        votes: 89,
        comments: 31,
        contributors: 15
      },
      amount: 68000,
      goalAmount: 70000,
      progress: 97
    }
  },
  {
    id: 'marketplace-8',
    action: 'post',
    actor: users.stanfordAILab,
    timestamp: '1d ago',
    item: {
      id: 'item-18',
      type: 'reward',
      title: 'Dataset Annotation: Medical Imaging',
      description: 'Help annotate MRI scans for machine learning model training. Medical background required.',
      user: users.stanfordAILab,
      timestamp: '1d ago',
      hub: hubs.artificialIntelligence,
      metrics: {
        votes: 24,
        comments: 7
      },
      amount: '300',
      deadline: '14 days',
      difficulty: 'Intermediate'
    }
  },
  {
    id: 'marketplace-9',
    action: 'post',
    actor: users.climateResearchInstitute,
    timestamp: '4d ago',
    item: {
      id: 'item-19',
      type: 'reward',
      title: 'Data Analysis: Weather Station Readings',
      description: 'Analyze and clean historical weather station data from remote locations.',
      user: users.climateResearchInstitute,
      timestamp: '4d ago',
      hub: hubs.climateScience,
      metrics: {
        votes: 18,
        comments: 5
      },
      amount: '250',
      deadline: '30 days',
      difficulty: 'Intermediate'
    }
  },
  {
    id: 'marketplace-10',
    action: 'post',
    actor: users.openBiologyInitiative,
    timestamp: '2d ago',
    item: {
      id: 'item-20',
      type: 'reward',
      title: 'Protocol Translation',
      description: 'Translate detailed laboratory protocols from English to Spanish. Biology expertise required.',
      user: users.openBiologyInitiative,
      timestamp: '2d ago',
      hub: hubs.biology,
      metrics: {
        votes: 9,
        comments: 2
      },
      amount: '200',
      deadline: '20 days',
      difficulty: 'Beginner'
    }
  },
  {
    id: 'marketplace-11',
    action: 'post',
    actor: users.nationalScienceFoundation,
    timestamp: '2d ago',
    item: {
      id: 'item-21',
      type: 'grant',
      title: 'Climate Change Impact Assessment Grant',
      description: 'Research grant for studying climate change effects on coastal ecosystems.',
      user: users.nationalScienceFoundation,
      timestamp: '2d ago',
      hub: hubs.climateScience,
      metrics: {
        votes: 45,
        comments: 8,
        applicants: 12
      },
      amount: '750,000'
    }
  }
];
