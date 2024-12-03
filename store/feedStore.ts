import { FeedEntry } from '@/types/feed';
import { users } from './userStore';
import { hubs } from './hubStore';


export const feedEntries: FeedEntry[] = [
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
        reposts: 12,
        saves: 18
      },
      amount: 30131,
      goalAmount: 36389,
      progress: 85,
      contributors: [
        users.elenaRodriguez,
        users.mariaPatel,
        users.openBiologyInitiative,
        users.bioRxiv,
        users.davidKumar
        
      ]
    }
  },
  {
    id: 'feed-1',
    action: 'share',
    actor: users.bioRxiv,
    timestamp: 'Oct 18, 2024',
    item: {
      id: 'item-1',
      type: 'paper',
      title: "Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity",
      description: "Bioactive sphingolipids (SLs) play critical roles in cellular function, including modifying the oncogenic potential of cancer cells. Depletion of the non-essential amino acid serine induces an intracellular shift from the generation of canonical SLs to non-canonical SLs known as deoxySLs, which can exert antitumor effects. Recent evidence has shown that restricting endogenous and exogenous sources of serine from cancer cells promotes antitumor immunity by activating the cyclic GMP-AMP Synthase-Stimulator of Interferon Genes (cGAS-STING) pathway. However, it is not known whether deoxySLs play a role in mediating this antitumor immune response. In this study, we demonstrated that depleting both externally supplied and internally synthesized serine from CT26 colon cancer cells maximally increased the levels of deoxySLs compared to removing either source alone. The ability of serine restriction to induce cytosolic accumulation of mitochondrial DNA (mtDNA) and subsequent activation of cGAS-STING components, including downstream Type I interferons (IFNs) was prevented by blocking deoxySL generation with the serine-palmitoyl transferase (SPT) inhibitor, myriocin. Direct administration of deoxysphinganine to cells induced mitochondrial dysfunction, in association with accumulation of cytosolic mtDNA, and increased expression of cGAS-STING components and Type I IFNs. A similar increase in IFNs was observed following mutation of SPT or supplementation of WT cells with alanine. Increasing deoxySLs in tumors through SPT mutation or feeding an alanine-enriched diet suppressed tumor growth in mice, while combining SPT mutation with a high alanine diet accentuated the antitumor effects. The observed tumor growth suppression was associated with increased infiltration of activated dendritic and cytotoxic T cells. Collectively, these findings reveal a novel role for deoxySLs in mediating antitumor immunity and provide support for the potential of using diet modification as an anticancer approach.",
      user: users.bioRxiv,
      timestamp: 'Oct 18, 2024',
      hub: hubs.molecularBiology,
      metrics: {
        votes: 8,
        comments: 12,
        reposts: 3,
        saves: 5
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
        comments: 4,
        reposts: 2,
        saves: 3
      },
      amount: 500,
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
        applicants: 8,
        reposts: 3,
        saves: 5
      },
      amount: 500000,
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
        reviewScore: 4,
        reposts: 2,
        saves: 3
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
        comments: 7,
        reposts: 2,
        saves: 3
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
        comments: 3,
        reposts: 2,
        saves: 3
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
        reposts: 3,
        saves: 5
      },
      amount: 45000,
      goalAmount: 75000,
      progress: 60,
      contributors: [
        users.adamDraper,
        users.elenaRodriguez,
        users.dominikus
      ]
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
        comments: 5,
        reposts: 2,
        saves: 3
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
        reposts: 3,
        saves: 5
      },
      amount: 2000,
      deadline: '5 days',
      difficulty: 'Intermediate',
      contributors: [
        users.mariaGarcia,
        users.alexThompson
      ]
    }
  },
  {
    id: 'marketplace-1',
    action: 'post',
    actor: users.sarahChen,
    timestamp: '3h ago',
    item: {
      id: 'item-11',
      type: 'funding_request' as const,
      title: 'ML for Early Detection of Neurodegenerative Diseases',
      description: 'Developing AI models to identify early biomarkers of neurodegeneration.',
      user: users.sarahChen,
      timestamp: '3h ago',
      hub: hubs.neuroscience,
      metrics: {
        votes: 28,
        comments: 15,
        reposts: 3,
        saves: 5
      },
      amount: 45000,
      goalAmount: 75000,
      progress: 60,
      contributors: [
        users.adamDraper,
        users.elenaRodriguez,
        users.dominikus,
        users.mariaGarcia,
        users.davidKumar
      ]
    }
  },
  {
    id: 'marketplace-2',
    action: 'post',
    actor: users.davidKumar,
    timestamp: '1d ago',
    item: {
      id: 'item-12',
      type: 'funding_request' as const,
      title: 'Sustainable Battery Materials Research',
      description: 'Investigating novel eco-friendly materials for next-generation battery technology with improved efficiency.',
      user: users.davidKumar,
      timestamp: '1d ago',
      hub: hubs.environmentalScience,
      metrics: {
        votes: 45,
        comments: 23,
        reposts: 3,
        saves: 5
      },
      amount: 12000,
      goalAmount: 50000,
      progress: 24,
      contributors: [
        users.elenaRodriguez,
        users.mariaPatel,
        users.openBiologyInitiative
      ]
    }
  },
  {
    id: 'marketplace-3',
    action: 'post',
    actor: users.elenaRodriguez,
    timestamp: '2d ago',
    item: {
      id: 'item-13',
      type: 'funding_request' as const,
      title: 'CRISPR Gene Therapy for Rare Diseases',
      description: 'Developing targeted gene therapy approaches for treating rare genetic disorders using CRISPR-Cas9.',
      user: users.elenaRodriguez,
      timestamp: '2d ago',
      hub: hubs.genetics,
      metrics: {
        votes: 156,
        comments: 42,
        reposts: 3,
        saves: 5
      },
      amount: 95000,
      goalAmount: 100000,
      progress: 95,
      contributors: [
        users.stanfordAILab,
        users.openBiologyInitiative,
        users.bioRxiv,
        users.elenaRodriguez,
        users.nationalScienceFoundation
      ]
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
        reposts: 3,
        saves: 5
      },
      contributors: [
        users.elenaRodriguez,
        users.dominikus,
        users.bioRxiv
      ],      
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
        reposts: 3,
        saves: 5
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
        comments: 7,
        reposts: 3,
        saves: 5
      },
      amount: 300,
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
        comments: 5,
        reposts: 3,
        saves: 5
      },
      amount: 250,
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
        comments: 2,
        reposts: 3,
        saves: 5
      },
      amount: 200,
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
        reposts: 3,
        saves: 5
      },
      amount: 750000,
      deadline: '30 days',
      contributors: [
        users.mariaPatel,
        users.jamesWilson,
        users.climateResearchInstitute,
        users.openBiologyInitiative,
        users.bioRxiv
      ]
    }
  }
];
