import { FeedEntry, User } from '@/types/feed';
import { Grant } from '@/types/grant';
import { users } from './userStore';
import { hubs } from './hubStore';

export const grants: Record<string, Grant> = {
  'urban-water-quality': {
    id: 'urban-water-quality',
    type: 'grant',
    title: "Urban Water Quality Assessment: A Multi-City Analysis of Municipal Water Systems Across America",
    abstract: "This grant aims to support researchers in conducting comprehensive water quality analysis in developing regions...",
    details: `
Our goal is to improve water quality assessment and treatment methods in developing regions through:

1. Development of cost-effective water quality testing methods
2. Analysis of contamination patterns and sources
3. Design of locally sustainable water treatment solutions
4. Community engagement and education programs

Expected Outcomes:
• Comprehensive water quality database for target regions
• Novel, affordable testing methodologies
• Sustainable treatment solution prototypes
• Published research findings in peer-reviewed journals
• Community education materials and programs

Research Areas:
• Water contamination analysis
• Environmental impact assessment
• Sustainable treatment technologies
• Public health implications
• Community engagement strategies`,
    createdBy: users.adamDraper,
    authors: [users.sarahChen, users.mariaGarcia],
    publishDate: "October 18, 2024",
    deadline: "December 15, 2024",
    hub: hubs.environmentalScience,
    doi: "10.1234/example.doi",
    keywords: ['Water Quality', 'Environmental Science', 'Sustainable Development', 'Public Health'],
    amount: "500,000",
    amountUSD: "250,000",
    status: "Open",
    metrics: {
      votes: 32,
      comments: 0,
      applicants: 3,
      views: 245,
      reposts: 0,
      saves: 0
    },
    applicants: [
      { user: users.sarahChen },
      { user: users.dominikus },
      { user: users.mariaPatel }
    ]
  }
};

export type Application = {
  id: string;
  user: User;
  description: string;
  timestamp: string;
  status: 'under_review' | 'accepted' | 'rejected';
  metrics: {
    votes: number;
    comments: number;
  };
};

export const grantApplications: Record<string, Application[]> = {
  'urban-water-quality': [
    {
      id: 'app-1',
      user: users.sarahChen,
      description: `Our research team proposes a comprehensive approach to analyzing water quality across major urban centers. 
        We will employ advanced spectroscopic techniques and machine learning algorithms to identify contaminants 
        and predict water quality trends. Our lab has extensive experience in environmental monitoring and data analysis.`,
      timestamp: '2d ago',
      status: 'under_review',
      metrics: {
        votes: 15,
        comments: 4
      }
    },
    {
      id: 'app-2',
      user: users.jamesWilson,
      description: `We propose to study water quality variations in urban areas using a novel combination of real-time 
        monitoring systems and citizen science initiatives. Our approach emphasizes community engagement while 
        maintaining rigorous scientific standards.`,
      timestamp: '3d ago',
      status: 'under_review',
      metrics: {
        votes: 12,
        comments: 3
      }
    }
  ]
}; 