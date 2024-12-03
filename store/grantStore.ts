import { FeedEntry } from '@/types/feed';
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
      comments: 12,
      applicants: 8,
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

export const grantApplications: Record<string, FeedEntry[]> = {
  'urban-water-quality': [
    {
      id: '1',
      action: 'apply',
      actor: users.sarahChen,
      timestamp: '2d ago',
      item: {
        id: 'app-1',
        type: 'grant',
        title: 'Application: Urban Water Quality Assessment Project',
        description: `Our research team proposes a comprehensive approach to analyzing water quality across major urban centers. 
          We will employ advanced spectroscopic techniques and machine learning algorithms to identify contaminants 
          and predict water quality trends. Our lab has extensive experience in environmental monitoring and data analysis.`,
        user: users.sarahChen,
        timestamp: '2d ago',
        hub: hubs.environmentalScience,
        metrics: {
          votes: 15,
          comments: 4,
          reposts: 0,
          saves: 0
        },
        amount: 500000,
        deadline: '30 days'
      }
    },
    {
      id: '2',
      action: 'apply',
      actor: users.jamesWilson,
      timestamp: '3d ago',
      item: {
        id: 'app-2',
        type: 'grant',
        title: 'Application: Urban Water Quality Assessment Project',
        description: `We propose to study water quality variations in urban areas using a novel combination of real-time 
          monitoring systems and citizen science initiatives. Our approach emphasizes community engagement while 
          maintaining rigorous scientific standards. Previous success in similar projects positions us well for this study.`,
        user: users.jamesWilson,
        timestamp: '3d ago',
        hub: hubs.environmentalScience,
        metrics: {
          votes: 12,
          comments: 3,
          reposts: 0,
          saves: 0
        },
        amount: 500000,
        deadline: '30 days'
      }
    },
    {
      id: '3',
      action: 'apply',
      actor: users.mariaPatel,
      timestamp: '4d ago',
      item: {
        id: 'app-3',
        type: 'grant',
        title: 'Application: Urban Water Quality Assessment Project',
        description: `Our proposal focuses on developing new methodologies for rapid water quality assessment in urban 
          environments. We will integrate IoT sensors with traditional analytical methods to create a comprehensive 
          monitoring system. Our team brings expertise in both environmental science and data analytics.`,
        user: users.mariaPatel,
        timestamp: '4d ago',
        hub: hubs.environmentalScience,
        metrics: {
          votes: 8,
          comments: 2,
          reposts: 0,
          saves: 0
        },
        amount: 500000,
        deadline: '30 days'
      }
    }
  ]
}; 