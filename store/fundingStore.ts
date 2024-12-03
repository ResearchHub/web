import { Funding } from '@/types/funding';
import { users } from './userStore';
import { hubs } from './hubStore';

export const mockFunding: Funding = {
  id: '1234',
  type: 'funding_request',
  title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
  objective: 'Develop a comprehensive understanding toward the influence of incentives for Open Peer Review toward tackling the Peer Review Crisis across the scientific publication ecosystem.',
  abstract: 'Open peer review (OPR) is an emerging concept in the scientific publication scene that has gained attention alongside the rise of open science. OPR has led to a starkly different dynamic and possibilities of how peer reviewers behave...',

  // User information
  user: users.dominikus,
  authors: [users.dominikus, users.sarahChen],

  // Metadata
  timestamp: 'Oct 9, 2024',
  publishDate: 'October 9, 2024',
  hub: hubs.researchMethods,
  doi: '10.55277/ResearchHub.taescjxh',
  keywords: ['Open Peer Review', 'Incentives', 'Research Methods', 'Scientometrics', 'Open Science'],

  // Funding specific
  amount: 30131,
  goalAmount: 36389,
  progress: 85,

  // Metrics grouped together
  metrics: {
    votes: 45,
    comments: 21,
    reposts: 12,
    saves: 18
  },

  content: `Motivation
  There is a need to formulate an incentive mechanism for open peer review that could be proven to be objective and reproducible in improving overall quality of research publication across various research domains by means of accelerated peer reviews that are thorough, useful, and accurate.
  
  Impact/Significance
  Incentivized Open Peer Review is a nascent concept within the broader peer review system, which still lacks: (1) relevant and accessible experimental data and (2) clear analysis indicating its effectiveness. The goal of this study is to demonstrate and promote better peer review incentive designs and facilitate future exploration in Incentivized Open Peer Review. To this end, a comprehensive set of carefully obtained research data is essential to lay down the foundation for subsequent studies within this domain. This work addresses this gap by establishing a framework that contributes to data curation, collection, and analysis methods. Ultimately, this allows for clearer understanding on the impact of incentivized open peer review on peer reviewer dynamics, economic behavior of peer reviewer, and how it improves review thoroughness, usefulness, and accuracy that benefits the larger scientific community.
  
  Project Timeline, October 2024 - August 2025
  • Pre-Registration [10/2024]
  • Fundraising through ResearchHub [10/2024 -11/2024]
  • Phase 1 [10/2024 - 01/2025]: Literature Review, Project Infrastructure, Existing Data Curation, and Experiment Design Refinement
  • Phase 2 [02/2025 - 04/2025]: Open Peer-Review Experiments, New Data Acquisition, and Analysis
  • Phase 3 [05/2025 - 08/2025]: Result Consolidation, Integrated Platform, and Manuscript Writing
  
  Research Deliverables
  • Open Dataset and Literature bundle for Incentivized vs Non-Incentivized Open Peer-Reviews
  • At least 1 Full-Fledge Scientific Paper that describes, analyzes, and summarizes the investigation
  • Open-Source Peer Review Quality Scoring Model/Algorithms
  • 18 Bi-Weekly Progress Reports that serve as Proof-of-Research
  • Integrated Platform to present all research output and metadata
  • Open lecture to present the findings at Metascience 2025 Conference in London`,

  contributors: [
    { user: users.elenaRodriguez, amount: 5000 },
    { user: users.mariaPatel, amount: 3500 },
    { user: users.openBiologyInitiative, amount: 10000 },
    { user: users.bioRxiv, amount: 8000 },
    { user: users.davidKumar, amount: 3631 }
  ]
};

