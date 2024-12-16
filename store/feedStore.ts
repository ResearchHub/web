import { FeedEntry } from '@/types/feed';
import { users } from './userStore';
import { hubs } from './hubStore';


export const feedEntries: FeedEntry[] = [
  {
    id: 'feed-comment-2',
    action: 'post',
    actor: users.sarahChen,
    timestamp: '2024-12-16 15:24:06.069373+00',
    item: {
      id: 'comment-2',
      type: 'comment',
      content: "Thank you for the feedback! We're currently working on extending this to regional models.",
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
      description: 'A novel approach to climate modeling using transformer architectures.',
      user: users.sarahChen,
      timestamp: '1d ago',
      hub: hubs.climateScience,
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
      description: 'Research project exploring the impact of incentive structures on peer review quality and participation.',
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
        
      ]
    },
    metrics: {
      votes: 45,
      comments: 21,
      reposts: 12,
      saves: 18
    },    
  },
  // For repost, how do you suggest I add text associated with the repost?
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
      description: "Bioactive sphingolipids (SLs) play critical roles in cellular function, including modifying the oncogenic potential of cancer cells. Depletion of the non-essential amino acid serine induces an intracellular shift from the generation of canonical SLs to non-canonical SLs known as deoxySLs, which can exert antitumor effects. Recent evidence has shown that restricting endogenous and exogenous sources of serine from cancer cells promotes antitumor immunity by activating the cyclic GMP-AMP Synthase-Stimulator of Interferon Genes (cGAS-STING) pathway. However, it is not known whether deoxySLs play a role in mediating this antitumor immune response. In this study, we demonstrated that depleting both externally supplied and internally synthesized serine from CT26 colon cancer cells maximally increased the levels of deoxySLs compared to removing either source alone. The ability of serine restriction to induce cytosolic accumulation of mitochondrial DNA (mtDNA) and subsequent activation of cGAS-STING components, including downstream Type I interferons (IFNs) was prevented by blocking deoxySLs generation with the serine-palmitoyl transferase (SPT) inhibitor, myriocin. Direct administration of deoxysphinganine to cells induced mitochondrial dysfunction, in association with accumulation of cytosolic mtDNA, and increased expression of cGAS-STING components and Type I IFNs. A similar increase in IFNs was observed following mutation of SPT or supplementation of WT cells with alanine. Increasing deoxySLs in tumors through SPT mutation or feeding an alanine-enriched diet suppressed tumor growth in mice, while combining SPT mutation with a high alanine diet accentuated the antitumor effects. The observed tumor growth suppression was associated with increased infiltration of activated dendritic and cytotoxic T cells. Collectively, these findings reveal a novel role for deoxySLs in mediating antitumor immunity and provide support for the potential of using diet modification as an anticancer approach.",
      user: users.bioRxiv,
      timestamp: '2024-12-14 09:24:06.069373+00',
      hub: hubs.molecularBiology,
      authors: [
        { name: "Suchandrima Saha", verified: true },
        { name: "Fabiola Velázquez", verified: false },
        { name: "David Montrose", verified: true },
        { name: "Hundessa Nemomssa", verified: false },
        { name: "Sarah Chen", verified: true },
      ],
      doi: "10.1101/2024.10.16.618749",
      journal: "bioRxiv (Cold Spring Harbor Laboratory)"
    },
    metrics: {
      votes: 8,
      comments: 12,
      reposts: 3,
      saves: 5
    },    
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
      description: 'We are seeking expert peer reviewers for a groundbreaking study on hippocampal memory consolidation. The manuscript employs cutting-edge optogenetic techniques combined with calcium imaging to investigate synaptic plasticity during memory formation. Ideal reviewers should have expertise in neuroscience, particularly in memory research, optogenetics, or calcium imaging. The review should evaluate the methodology, statistical analysis, and interpretation of results. Special attention should be given to the novel combination of techniques and their potential implications for understanding memory formation mechanisms.',
      user: users.researchHub,
      timestamp: '2024-12-14 11:24:06.069373+00',
      hub: hubs.neuroscience,
      amount: 500,
      deadline: 'Oct 25, 2024',
    },
    relatedItem: {
      id: 'paper-memory-formation',
      type: 'paper',
      title: 'Neural Mechanisms of Memory Formation: A Novel Approach Using Optogenetics',
      description: 'This study investigates the fundamental mechanisms of memory formation in the hippocampus using state-of-the-art optogenetic techniques combined with high-resolution calcium imaging.',
      user: users.jamesWilson,
      timestamp: '2024-12-13 09:24:06.069373+00',
      hub: hubs.neuroscience,
      authors: [
        { name: "James Wilson", verified: true },
        { name: "Sarah Chen", verified: true },
        { name: "David Kumar", verified: false }
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
    },    
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
      description: 'Seeking researchers to conduct comprehensive water quality analysis in developing regions.',
      user: users.adamDraper,
      timestamp: '2024-12-13 13:24:06.069373+00',
      hub: hubs.environmentalScience,
      amount: 500000,
      applicants: [
        users.elenaRodriguez,
        users.mariaPatel,
        users.sarahChen,
        users.davidKumar,
        users.jamesWilson,
        users.alexThompson,
        users.mariaGarcia,
        users.hundessaNemomssa
      ]
    },
    metrics: {
      votes: 32,
      comments: 12,
      applicants: 8,
      reposts: 3,
      saves: 5
    },    
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
      description: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      user: users.elenaRodriguez,
      timestamp: '2024-12-16 15:24:06.069373+00',
      hub: hubs.medicalDevices,
      amount: 150
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
      description: 'Contributed to funding request for early detection of neurodegenerative diseases.',
      user: users.alexThompson,
      timestamp: '2024-12-16 16:45:06.069373+00',
      hub: hubs.neuroscience,
      amount: 500
    },
    relatedItem: {
      id: 'item-8',
      type: 'funding_request',
      title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
      description: 'Developing AI models to identify early biomarkers of neurodegeneration using multi-modal medical imaging data.',
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
    },    
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
      description: 'New preprint exploring recent developments in flexible printed heaters for medical devices.',
      user: users.hundessaNemomssa,
      timestamp: '2024-12-16 13:24:06.069373+00',
      hub: hubs.medicalDevices,
      authors: [
        { name: "John Doe", verified: true },
        { name: "Jane Smith", verified: false }
      ],
      doi: "10.1101/2024.10.16.618750",
      journal: "Journal of Medical Devices"
    },
    metrics: {
      votes: 24,
      comments: 7,
      reposts: 2,
      saves: 3
    },    
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
      description: 'Contributed to reward for statistical analysis of COVID-19 vaccination efficacy data.',
      user: users.mariaGarcia,
      timestamp: '2024-12-16 16:15:06.069373+00',
      hub: hubs.dataScience,
      amount: 750
    },
    relatedItem: {
      id: 'item-10',
      type: 'reward',
      title: 'Statistical Analysis of COVID-19 Vaccination Efficacy Data',
      description: 'Analyze vaccination efficacy data to provide insights into vaccine performance.',
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
    },    
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
      description: 'Developing AI models to identify early biomarkers of neurodegeneration.',
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
      ]
    },
    metrics: {
      votes: 28,
      comments: 15,
      reposts: 3,
      saves: 5
    },    
  },
  {
    id: 'marketplace-5',
    action: 'post',
    actor: users.mariaPatel,
    timestamp: '2024-12-13 16:24:06.069373+00',
    item: {
      id: 'item-15',
      type: 'funding_request',
      title: 'Quantum Computing Algorithm Development',
      description: 'Research into novel quantum algorithms for optimization problems in computational chemistry.',
      user: users.mariaPatel,
      timestamp: '2024-12-13 16:24:06.069373+00',
      hub: hubs.quantumComputing,
      amount: 68000,
      goalAmount: 70000,
      progress: 97
    },
    metrics: {
      votes: 89,
      comments: 31,
      reposts: 3,
      saves: 5
    },    
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
      description: 'Help annotate MRI scans for machine learning model training. Medical background required.',
      user: users.stanfordAILab,
      timestamp: '2024-12-15 16:24:06.069373+00',
      hub: hubs.artificialIntelligence,
      amount: 300,
      deadline: '14 days',
    },
    metrics: {
      votes: 24,
      comments: 7,
      reposts: 3,
      saves: 5
    },    
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
      description: 'Analyze and clean historical weather station data from remote locations.',
      user: users.climateResearchInstitute,
      timestamp: '2024-12-13 16:24:06.069373+00',
      hub: hubs.climateScience,
      amount: 250,
      deadline: '30 days',
    },
    metrics: {
      votes: 18,
      comments: 5,
      reposts: 3,
      saves: 5
    },    
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
      description: 'Translate detailed laboratory protocols from English to Spanish. Biology expertise required.',
      user: users.openBiologyInitiative,
      timestamp: '2024-12-14 16:24:06.069373+00',
      hub: hubs.biology,
      amount: 200,
      deadline: '20 days',
    },
    metrics: {
      votes: 9,
      comments: 2,
      reposts: 3,
      saves: 5
    },    
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
      description: 'Research grant for studying climate change effects on coastal ecosystems.',
      user: users.nationalScienceFoundation,
      timestamp: '2024-12-14 16:24:06.069373+00',
      hub: hubs.climateScience,
      amount: 750000,
      deadline: '30 days',
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
      ]
    },
    metrics: {
      votes: 45,
      comments: 8,
      reposts: 3,
      saves: 5
    },    
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
//       item.description,
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
