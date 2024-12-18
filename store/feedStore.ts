import { FeedEntry } from '@/types/feed';
import { users } from './userStore';
import { hubs } from './hubStore';

export const feedEntries: FeedEntry[] = [
  {
    id: 'paper-1',
    action: 'publish',
    actor: users.elenaRodriguez,
    timestamp: '2024-01-10T15:30:00Z',
    item: {
      id: 'paper-1',
      type: 'paper',
      title: 'Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity',
      authors: [
        {
          name: "Elena Rodriguez",
          isVerified: true,
          user: users.elenaRodriguez
        },
        {
          name: "Suchandrima Saha",
          isVerified: false
        },
        {
          name: "Fabiola Velázquez",
          isVerified: false
        },
        {
          name: "Sarah Chen",
          isVerified: false
        }
      ],
      user: users.elenaRodriguez,
      abstract: "Bioactive sphingolipids (SLs) play critical roles in cellular function and signaling pathways. This study investigates the novel role of deoxysphingolipids in activating the cGAS-STING pathway in colon cancer cells. Through comprehensive analysis of metabolomic and transcriptomic data, we demonstrate that deoxysphingolipids serve as endogenous danger signals that trigger innate immune responses. Our findings reveal a previously unknown mechanism by which altered sphingolipid metabolism can modulate anti-tumor immunity, suggesting potential therapeutic applications in cancer immunotherapy.",
      timestamp: '2024-01-10T15:30:00Z',
      slug: 'deoxysphingolipids-activate-cgas-sting'
    },
    metrics: {
      votes: 15,
      comments: 8,
      reposts: 12
    }
  },
  {
    id: 'feed-comment-2',
    action: 'post',
    actor: users.sarahChen,
    timestamp: '2024-12-16 15:24:06.069373+00',
    item: {
      id: 'comment-2',
      type: 'comment',
      content: "Thank you for the feedback! We're currently working on extending this to regional models. Our preliminary results show promising accuracy improvements when incorporating local meteorological patterns and topographical data. ",
      user: users.sarahChen,
      timestamp: '2024-12-16 15:24:06.069373+00',
      parent: {
        id: 'comment-1',
        type: 'comment',
        content: 'The methodology presented here opens up exciting possibilities for climate modeling. The use of transformer architectures is particularly innovative.',
        user: users.jamesWilson,
        timestamp: '2024-12-16 14:24:06.069373+00',
      }
    },
    relatedItem: {
      id: 'paper-neural-networks',
      type: 'paper',
      title: 'Neural Networks in Climate Prediction',
      abstract: 'A novel approach to climate modeling using transformer architectures.',
      user: users.sarahChen,
      timestamp: '1d ago',
      hub: hubs.climateScience,
      authors: [
        { name: "Sarah Chen", isVerified: true },
        { name: "James Wilson", isVerified: false }
      ],
      doi: "10.1101/2024.12.13.123456",
      journal: "bioRxiv",
      slug: 'neural-networks-in-climate-prediction'
    },
    metrics: {
      votes: 8,
      comments: 1,
      reposts: 0,
      saves: 1
    }    
  },
  {
    id: 'feed-2',
    action: 'post',
    actor: users.dominikus,
    timestamp: '2024-12-13 10:24:06.069373+00',
    item: {
      id: 'item-2',
      type: 'funding_request',
      title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
      abstract: 'Research project exploring the impact of incentive structures on peer review quality and participation.',
      user: users.dominikus,
      timestamp: '2024-12-13 10:24:06.069373+00',
      hub: hubs.researchMethods,
      amount: 30131,
      goalAmount: 36389,
      progress: 85,
      contributors: [
        users.elenaRodriguez,
        users.mariaPatel,
        users.openBiologyInitiative,
        users.bioRxiv,
        users.davidKumar
      ],
      slug: 'incentivized-vs-non-incentivized-open-peer-reviews'
    },
    metrics: {
      votes: 45,
      comments: 21,
      reposts: 12,
      saves: 18
    }    
  },
  {
    id: 'feed-1',
    action: 'repost',
    actor: users.bioRxiv,
    timestamp: '2024-12-14 09:24:06.069373+00',
    repostMessage: "Exciting research on cancer cell immunity - this could have significant implications for treatment approaches. What are your thoughts on the methodology?",
    item: {
      id: 'item-1',
      type: 'paper',
      title: "Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity",
      abstract: "Bioactive sphingolipids (SLs) play critical roles in cellular function and signaling pathways. This study investigates the novel role of deoxysphingolipids in activating the cGAS-STING pathway in colon cancer cells. Through comprehensive analysis of metabolomic and transcriptomic data, we demonstrate that deoxysphingolipids serve as endogenous danger signals, triggering innate immune responses. Our findings reveal a previously unknown mechanism by which these lipids enhance tumor immunity through direct activation of the STING pathway, leading to increased type I interferon production and enhanced T cell recruitment. This discovery opens new therapeutic possibilities for cancer immunotherapy by targeting sphingolipid metabolism.",
      user: users.bioRxiv,
      timestamp: '2024-12-14 09:24:06.069373+00',
      hub: hubs.molecularBiology,
      authors: [
        { name: "Suchandrima Saha", isVerified: true },
        { name: "Fabiola Velázquez", isVerified: false },
        { name: "David Montrose", isVerified: true },
        { name: "Hundessa Nemomssa", isVerified: false },
        { name: "Sarah Chen", isVerified: true }
      ],
      doi: "10.1101/2024.10.16.618749",
      journal: "bioRxiv (Cold Spring Harbor Laboratory)",
      slug: 'deoxysphingolipids-activate-cgas-sting'
    },
    metrics: {
      votes: 8,
      comments: 12,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'feed-3',
    action: 'post',
    actor: users.researchHub,
    timestamp: '2024-12-14 11:24:06.069373+00',
    item: {
      id: 'item-3',
      type: 'reward',
      title: 'Peer Review: Neural Mechanisms of Memory Formation',
      abstract: 'We are seeking expert peer reviewers for a groundbreaking study...',
      user: users.researchHub,
      timestamp: '2024-12-14 11:24:06.069373+00',
      hub: hubs.neuroscience,
      amount: 500,
      deadline: 'Oct 25, 2024',
      slug: 'peer-review-neural-mechanisms-memory-formation'
    },
    relatedItem: {
      id: 'paper-memory-formation',
      type: 'paper',
      title: 'Neural Mechanisms of Memory Formation: A Novel Approach Using Optogenetics',
      abstract: 'This study investigates the fundamental mechanisms of memory formation...',
      user: users.jamesWilson,
      timestamp: '2024-12-13 09:24:06.069373+00',
      hub: hubs.neuroscience,
      authors: [
        { name: "James Wilson", isVerified: true },
        { name: "Sarah Chen", isVerified: true },
        { name: "David Kumar", isVerified: false }
      ],
      doi: "10.1101/2024.12.13.123456",
      journal: "bioRxiv",
      slug: 'neural-mechanisms-of-memory-formation'
    },
    metrics: {
      votes: 15,
      comments: 4,
      reposts: 2,
      saves: 3
    }    
  },
  {
    id: 'feed-4',
    action: 'post',
    actor: users.adamDraper,
    timestamp: '2024-12-13 13:24:06.069373+00',
    item: {
      id: 'urban-water-quality',
      type: 'grant',
      title: 'Urban Water Quality Assessment: A Multi-City Analysis of Municipal Water Systems Across America',
      abstract: 'Seeking researchers to conduct comprehensive water quality analysis in developing regions.',
      user: users.adamDraper,
      timestamp: '2024-12-13 13:24:06.069373+00',
      hub: hubs.environmentalScience,
      amount: 500000,
      deadline: '2024-12-30 16:24:06.069373+00',
      applicants: [
        users.elenaRodriguez,
        users.mariaPatel,
        users.sarahChen,
        users.davidKumar,
        users.jamesWilson,
        users.alexThompson,
        users.mariaGarcia,
        users.hundessaNemomssa
      ],
      slug: 'urban-water-quality-assessment'
    },
    metrics: {
      votes: 32,
      comments: 12,
      applicants: 8,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'feed-5',
    action: 'post',
    actor: users.elenaRodriguez,
    timestamp: '2024-12-13 14:24:06.069373+00',
    item: {
      id: 'item-5',
      type: 'review',
      title: 'Review of "Revolutionizing Patient Care: Advances in Flexible Printed Heaters"',
      abstract: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      user: users.elenaRodriguez,
      timestamp: '2024-12-16 15:24:06.069373+00',
      hub: hubs.medicalDevices,
      amount: 150,
      slug: 'review-revolutionizing-patient-care'
    },
    metrics: {
      votes: 12,
      comments: 3,
      reviewScore: 4,
      reposts: 2,
      saves: 3
    }
  },
  {
    id: 'feed-7',
    action: 'contribute',
    actor: users.alexThompson,
    timestamp: '2024-12-16 16:45:06.069373+00',
    item: {
      id: 'item-7',
      type: 'contribution',
      title: 'Contribution to Neurodegenerative Disease Research',
      abstract: 'Contributed to funding request for early detection of neurodegenerative diseases.',
      user: users.alexThompson,
      timestamp: '2024-12-16 16:45:06.069373+00',
      hub: hubs.neuroscience,
      amount: 500
    },
    relatedItem: {
      id: 'item-8',
      type: 'funding_request',
      title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
      abstract: 'Developing AI models to identify early biomarkers of neurodegeneration using multi-modal medical imaging data.',
      user: users.sarahChen,
      timestamp: '2024-12-16 14:24:06.069373+00',
      hub: hubs.neuroscience,
      amount: 45000,
      goalAmount: 75000,
      progress: 60,
      contributors: [
        users.adamDraper,
        users.elenaRodriguez,
        users.dominikus
      ],
      slug: 'ml-approaches-early-detection-neurodegenerative-diseases'
    },
    metrics: {
      votes: 12,
      comments: 3,
      reposts: 2,
      saves: 3
    }    
  },
  {
    id: 'feed-6',
    action: 'publish',
    actor: users.hundessaNemomssa,
    timestamp: '2024-12-16 13:24:06.069373+00',
    item: {
      id: 'item-6',
      type: 'paper',
      title: 'Revolutionizing Patient Care: A Comprehensive Review',
      abstract: 'New preprint exploring recent developments in flexible printed heaters for medical devices.',
      user: users.hundessaNemomssa,
      timestamp: '2024-12-16 13:24:06.069373+00',
      hub: hubs.medicalDevices,
      authors: [
        { name: "John Doe", isVerified: true },
        { name: "Jane Smith", isVerified: false }
      ],
      doi: "10.1101/2024.10.16.618750",
      journal: "Journal of Medical Devices",
      slug: 'revolutionizing-patient-care-comprehensive-review'
    },
    metrics: {
      votes: 24,
      comments: 7,
      reposts: 2,
      saves: 3
    }    
  },
  {
    id: 'feed-8',
    action: 'contribute',
    actor: users.mariaGarcia,
    timestamp: '2024-12-16 16:15:06.069373+00',
    item: {
      id: 'item-9',
      type: 'contribution',
      title: 'Contribution to COVID-19 Vaccination Efficacy Data Analysis',
      abstract: 'Contributed to reward for statistical analysis of COVID-19 vaccination efficacy data.',
      user: users.mariaGarcia,
      timestamp: '2024-12-16 16:15:06.069373+00',
      hub: hubs.dataScience,
      amount: 750
    },
    relatedItem: {
      id: 'item-10',
      type: 'reward',
      title: 'Statistical Analysis of COVID-19 Vaccination Efficacy Data',
      abstract: 'Analyze vaccination efficacy data to provide insights into vaccine performance.',
      user: users.researchHub,
      timestamp: '2024-12-14 16:24:06.069373+00',
      hub: hubs.dataScience,
      amount: 2000,
      deadline: '5 days',
      contributors: [
        users.mariaGarcia,
        users.alexThompson
      ],
      slug: 'statistical-analysis-covid19-vaccination-efficacy-data'
    },
    metrics: {
      votes: 20,
      comments: 10,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'marketplace-1',
    action: 'post',
    actor: users.sarahChen,
    timestamp: '2024-12-16 14:24:06.069373+00',
    item: {
      id: 'item-11',
      type: 'funding_request',
      title: 'ML for Early Detection of Neurodegenerative Diseases',
      abstract: 'Developing AI models to identify early biomarkers of neurodegeneration.',
      user: users.sarahChen,
      timestamp: '2024-12-16 14:24:06.069373+00',
      hub: hubs.neuroscience,
      amount: 45000,
      goalAmount: 75000,
      progress: 60,
      contributors: [
        users.adamDraper,
        users.elenaRodriguez,
        users.dominikus,
        users.mariaGarcia,
        users.davidKumar
      ],
      slug: 'ml-early-detection-neurodegenerative-diseases'
    },
    metrics: {
      votes: 28,
      comments: 15,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'marketplace-8',
    action: 'post',
    actor: users.stanfordAILab,
    timestamp: '2024-12-15 16:24:06.069373+00',
    item: {
      id: 'item-18',
      type: 'reward',
      title: 'Dataset Annotation: Medical Imaging',
      abstract: 'Help annotate MRI scans for machine learning model training. Medical background required.',
      user: users.stanfordAILab,
      timestamp: '2024-12-15 16:24:06.069373+00',
      hub: hubs.artificialIntelligence,
      amount: 300,
      deadline: '14 days',
      slug: 'dataset-annotation-medical-imaging'
    },
    metrics: {
      votes: 24,
      comments: 7,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'marketplace-9',
    action: 'post',
    actor: users.climateResearchInstitute,
    timestamp: '2024-12-13 16:24:06.069373+00',
    item: {
      id: 'item-19',
      type: 'reward',
      title: 'Data Analysis: Weather Station Readings',
      abstract: 'Analyze and clean historical weather station data from remote locations.',
      user: users.climateResearchInstitute,
      timestamp: '2024-12-13 16:24:06.069373+00',
      hub: hubs.climateScience,
      amount: 250,
      deadline: '30 days',
      slug: 'data-analysis-weather-station-readings'
    },
    metrics: {
      votes: 18,
      comments: 5,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'marketplace-10',
    action: 'post',
    actor: users.openBiologyInitiative,
    timestamp: '2024-12-14 16:24:06.069373+00',
    item: {
      id: 'item-20',
      type: 'reward',
      title: 'Protocol Translation',
      abstract: 'Translate detailed laboratory protocols from English to Spanish. Biology expertise required.',
      user: users.openBiologyInitiative,
      timestamp: '2024-12-14 16:24:06.069373+00',
      hub: hubs.biology,
      amount: 200,
      deadline: '20 days',
      slug: 'protocol-translation'
    },
    metrics: {
      votes: 9,
      comments: 2,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'marketplace-11',
    action: 'post',
    actor: users.nationalScienceFoundation,
    timestamp: '2024-12-14 16:24:06.069373+00',
    item: {
      id: 'item-21',
      type: 'grant',
      title: 'Climate Change Impact Assessment Grant',
      abstract: 'Research grant for studying climate change effects on coastal ecosystems.',
      user: users.nationalScienceFoundation,
      timestamp: '2024-12-14 16:24:06.069373+00',
      hub: hubs.climateScience,
      amount: 750000,
      deadline: '2024-12-30 16:24:06.069373+00',
      contributors: [
        users.mariaPatel,
        users.jamesWilson,
        users.climateResearchInstitute,
        users.openBiologyInitiative,
        users.bioRxiv
      ],
      applicants: [
        users.elenaRodriguez,
        users.davidKumar,
        users.sarahChen
      ],
      slug: 'climate-change-impact-assessment-grant'
    },
    metrics: {
      votes: 45,
      comments: 8,
      reposts: 3,
      saves: 5
    }    
  }
];

// export function searchFeedItems(query: string): FeedEntry[] {
//   if (!query.trim()) return [];
  
//   const searchTerm = query.toLowerCase().trim();
  
//   return feedEntries.filter(entry => {
//     const item = entry.item;
    
//     // Common searchable fields that exist on all items
//     const searchableFields = [
//       item.title,
//       item.abstract,
//       item.type,
//       item.hub.name,
//       item.user.fullName
//     ];
    
//     // Add type-specific searchable fields
//     switch (item.type) {
//       case 'paper':
//         if ('authors' in item && item.authors) {
//           const authorNames = item.authors.map(author => author.name);
//           searchableFields.push(...authorNames);
//           if ('doi' in item) searchableFields.push(item.doi);
//           if ('journal' in item) searchableFields.push(item.journal);
//         }
//         break;
      
//       case 'funding_request':
//       case 'reward':
//       case 'grant':
//         if ('amount' in item) {
//           searchableFields.push(item.amount.toString());
//         }
//         break;
//     }
    
//     // Return true if any field contains the search term
//     return searchableFields.some(field => 
//       field?.toString().toLowerCase().includes(searchTerm)
//     );
//   });
// }
