import { FeedEntry } from '@/types/feed';
import { users } from './userStore';
import { hubs } from './hubStore';
import dayjs from 'dayjs';

// Helper to generate future dates relative to Dec 23rd, 2024
const baseDate = dayjs('2024-12-23');
const futureDate = (days: number) => baseDate.add(days, 'day').toISOString();

export const feedEntries: FeedEntry[] = [
  {
    id: 'feed-8',
    action: 'contribute',
    timestamp: '2024-12-16 16:15:06.069373+00',
    content: {
      id: 'item-9',
      type: 'contribution',
      timestamp: '2024-12-16 16:15:06.069373+00',
      hub: hubs.dataScience,
      amount: 750,
      slug: 'contribution-statistical-analysis',
      title: 'Contribution to Statistical Analysis',
      actor: users.mariaGarcia,
    },
    target: {
      id: 'item-10',
      type: 'bounty',
      title: 'Statistical Analysis of COVID-19 Vaccination Efficacy Data',
      description: 'Analyze vaccination efficacy data to provide insights into vaccine performance.',
      timestamp: '2024-12-14 16:24:06.069373+00',
      hub: hubs.dataScience,
      amount: 2000,
      deadline: futureDate(5),
      slug: 'statistical-analysis-covid19-vaccination-efficacy-data',
      actor: users.researchHub,
    },
    contributors: [{
      profile: users.mariaGarcia,
      amount: 750
    }, {
      profile: users.alexThompson,
      amount: 1250
    }],
    metrics: {
      votes: 20,
      comments: 10,
      reposts: 3,
      saves: 5,
      // For bounties, earned amount will be target.amount. It is double exposed.
      earned: 2000,
    }    
  },  
  {
    id: 'feed-7',
    action: 'contribute',
    timestamp: '2024-12-16 16:45:06.069373+00',
    content: {
      id: 'item-7',
      type: 'contribution',
      timestamp: '2024-12-16 16:45:06.069373+00',
      hub: hubs.neuroscience,
      amount: 500,
      slug: 'contribution-ml-approaches',
      title: 'Contribution to ML Research',
      actor: users.alexThompson
    },
    target: {
      id: 'item-8',
      type: 'funding_request',
      status: 'OPEN',
      title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
      abstract: 'Developing AI models to identify early biomarkers of neurodegeneration using multi-modal medical imaging data.',
      timestamp: '2024-12-16 14:24:06.069373+00',
      hub: hubs.neuroscience,
      amount: 45000,
      goalAmount: 100000,
      deadline: futureDate(20),
      slug: 'ml-approaches-early-detection-neurodegenerative-diseases',
      actor: users.sarahChen,
    },
    contributors: [{
      profile: users.adamDraper,
      amount: 500
    }, {
      profile: users.elenaRodriguez,
      amount: 10000
    }, {
      profile: users.dominikus,
      amount: 10000
    }, {
      profile: users.alexThompson,
      amount: 24500
    }],
    metrics: {
      votes: 12,
      comments: 3,
      reposts: 2,
      saves: 3,
      earned: 45000,
    }    
  },
  {
    id: 'paper-1',
    action: 'publish',
    timestamp: '2024-01-10T15:30:00Z',
    content: {
      id: 'paper-1',
      type: 'paper',
      title: 'Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity',
      abstract: 'Bioactive sphingolipids (SLs) play critical roles in cellular function and signaling pathways. This study investigates the novel role of deoxysphingolipids in activating the cGAS-STING pathway in colon cancer cells. Through comprehensive analysis of metabolomic and transcriptomic data, we demonstrate that deoxysphingolipids serve as endogenous danger signals that trigger innate immune responses. Our findings reveal a previously unknown mechanism by which altered sphingolipid metabolism can modulate anti-tumor immunity, suggesting potential therapeutic applications in cancer immunotherapy.',
      timestamp: '2024-01-10T15:30:00Z',
      hub: hubs.neuroscience,
      slug: 'deoxysphingolipids-activate-cgas-sting',
      actor: users.elenaRodriguez,
      authors: [
        users.sarahChen,
        users.jamesWilson,
        users.dominikus
      ]
    },
    contributors: [
      {
        profile: users.sarahChen,
        amount: 210
      },
      {
        profile: users.jamesWilson,
        amount: 340
      }
    ],
    metrics: {
      votes: 15,
      comments: 8,
      reposts: 12,
      saves: 4,
      earned: 550,
    }
  },
  {
    id: 'feed-comment-2',
    action: 'post',
    timestamp: '2024-12-16 15:24:06.069373+00',
    content: {
      id: 'comment-2',
      type: 'comment',
      content: "Thank you for the feedback! We're currently working on extending this to regional models. Our preliminary results show promising accuracy improvements when incorporating local meteorological patterns and topographical data. ",
      timestamp: '2024-12-16 15:24:06.069373+00',
      hub: hubs.climateScience,
      slug: 'comment-2-regional-models-response',
      actor: users.sarahChen,
      parent: {
        id: 'comment-1',
        type: 'comment',
        content: 'The methodology presented here opens up exciting possibilities for climate modeling. The use of transformer architectures is particularly innovative.',
        timestamp: '2024-12-16 14:24:06.069373+00',
        hub: hubs.climateScience,
        slug: 'comment-1-methodology-feedback',
        actor: users.jamesWilson
      }
    },
    context: {
      id: 'paper-neural-networks',
      type: 'paper',
      title: 'Neural Networks in Climate Prediction',
      abstract: 'A novel approach to climate modeling using transformer architectures.',
      timestamp: '2024-12-15 16:24:06.069373+00',
      hub: hubs.climateScience,
      doi: "10.1101/2024.12.13.123456",
      journal: "bioRxiv",
      slug: 'neural-networks-in-climate-prediction',
      actor: users.sarahChen,
      authors: [
        users.sarahChen,
        users.jamesWilson,
        users.dominikus
      ]
    },
    contributors: [
      {
        profile: users.sarahChen,
        amount: 500
      },
      {
        profile: users.jamesWilson,
        amount: 500
      }
    ],
    metrics: {
      votes: 8,
      comments: 1,
      reposts: 0,
      saves: 1,
      earned: 1000
    }    
  },
  {
    id: 'feed-5',
    action: 'post',
    timestamp: '2024-12-13 14:24:06.069373+00',
    content: {
      id: 'item-5',
      type: 'review',
      title: 'Review of "Revolutionizing Patient Care: Advances in Flexible Printed Heaters"',
      content: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      timestamp: '2024-12-16 15:24:06.069373+00',
      hub: hubs.medicalDevices,
      slug: 'review-revolutionizing-patient-care',
      actor: users.elenaRodriguez,
      score: 4
    },
    contributors: [
      {
        profile: users.dominikus,
        amount: 500
      }
    ],
    metrics: {
      votes: 12,
      comments: 3,
      reposts: 2,
      saves: 3,
      earned: 500
    }
  },
  {
    id: 'feed-4',
    action: 'post',
    timestamp: '2024-12-13 13:24:06.069373+00',
    content: {
      id: 'urban-water-quality',
      type: 'grant',
      title: 'Urban Water Quality Assessment: A Multi-City Analysis of Municipal Water Systems Across America',
      abstract: 'Seeking researchers to conduct comprehensive water quality analysis in developing regions.',
      timestamp: '2024-12-13 13:24:06.069373+00',
      hub: hubs.environmentalScience,
      amount: 500000,
      deadline: '2024-12-30 16:24:06.069373+00',
      slug: 'urban-water-quality-assessment',
      actor: users.adamDraper
    },
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
    contributors: [],
    metrics: {
      votes: 32,
      comments: 12,
      applicants: 8,
      reposts: 3,
      saves: 5
    }    
  },
  {
    id: 'feed-standalone-comment',
    action: 'post',
    timestamp: '2024-12-16 12:24:06.069373+00',
    content: {
      id: 'comment-standalone',
      type: 'comment',
      content: "Our latest spectroscopic analysis revealed a significant shift in the absorption peaks (Δλ = 15nm) when the sample was exposed to varying pH levels (6.5-8.0). This suggests potential applications in biosensing, particularly for monitoring subtle changes in cellular microenvironments.",
      timestamp: '2024-12-16 12:24:06.069373+00',
      hub: hubs.biophysics,
      slug: 'spectroscopic-analysis-comment',
      actor: users.jamesWilson
    },
    context: {
      id: 'paper-spectroscopic',
      type: 'paper',
      title: 'Novel pH-Sensitive Fluorescent Probes for Real-Time Cellular Imaging',
      abstract: 'We present a new class of fluorescent molecular probes that exhibit remarkable sensitivity to physiological pH changes. These probes demonstrate exceptional photostability and minimal photobleaching, making them ideal for long-term cellular imaging applications.',
      timestamp: '2024-12-15 10:24:06.069373+00',
      hub: hubs.biophysics,
      doi: "10.1038/s41557-024-1234-5",
      journal: "Nature Chemistry",
      slug: 'novel-ph-sensitive-fluorescent-probes',
      actor: users.sarahChen,
      authors: [
        users.sarahChen,
        users.jamesWilson,
        users.elenaRodriguez
      ]
    },
    contributors: [],
    metrics: {
      votes: 5,
      comments: 0,
      reposts: 1,
      saves: 2,
      earned: 0
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
