import { FeedEntry, User, Hub } from '@/types/feed';

const users: Record<string, User> = {
  researchHub: {
    id: 'rhub-001',
    fullName: 'ResearchHub Foundation',
    verified: true,
    isOrganization: true,
    isVerified: true,
  },
  dominikus: {
    id: 'dom-001',
    fullName: 'Dominikus Brian',
    verified: true,
    isOrganization: false,
    isVerified: true,
  },
  bioRxiv: {
    id: 'biorxiv-001',
    fullName: 'bioRxiv (Cold Spring Harbor Laboratory)',
    verified: true,
    isOrganization: true,
    isVerified: true,
  },
  adamDraper: {
    id: 'adam-001',
    fullName: 'Adam Draper',
    verified: true,
    isOrganization: false,
    isVerified: true,
  },
  elenaRodriguez: {
    id: 'elena-001',
    fullName: 'Dr. Elena Rodriguez',
    verified: true,
    isOrganization: false,
    isVerified: true,
  },
  hundessaNemomssa: {
    id: 'hundessa-001',
    fullName: 'Hundessa Nemomssa',
    verified: true,
    isOrganization: false,
    isVerified: true,
  },
  alexThompson: {
    id: 'alex-001',
    fullName: 'Alex Thompson',
    verified: true,
    isOrganization: false,
    isVerified: true,
  },
  sarahChen: {
    id: 'sarah-001',
    fullName: 'Sarah Chen',
    verified: true,
    isOrganization: false,
    isVerified: true,
  },
  mariaGarcia: {
    id: 'maria-001',
    fullName: 'Maria Garcia',
    verified: true,
    isOrganization: false,
    isVerified: true,
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
  }
];
