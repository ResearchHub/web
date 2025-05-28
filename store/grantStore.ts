import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';

export interface GrantWithMetadata {
  work: Work;
  metadata: WorkMetadata;
}

const baseDate = new Date();
const futureDate = new Date(baseDate.setMonth(baseDate.getMonth() + 2));

const mockGrant1: GrantWithMetadata = {
  work: {
    id: 999,
    type: 'funding_request',
    contentType: 'funding_request',
    title: 'Demo Quantum Computing Research Grant',
    slug: 'demo-quantum-computing-grant',
    createdDate: new Date().toISOString(),
    authors: [
      {
        authorProfile: {
          id: 1,
          fullName: 'Ada Lovelace',
          firstName: 'Ada',
          lastName: 'Lovelace',
          profileImage: '',
          headline: 'Computer Scientist',
          profileUrl: '#',
          isClaimed: false,
          user: {
            isVerified: true,
          },
        },
        isCorresponding: true,
        position: 'first',
      },
      {
        authorProfile: {
          id: 2,
          fullName: 'Helen Quinn',
          firstName: 'Helen',
          lastName: 'Quinn',
          profileImage: '',
          headline: 'Particle Physicist',
          profileUrl: '#',
          isClaimed: false,
          user: {
            isVerified: true,
          },
        },
        isCorresponding: true,
        position: 'first',
      },
    ],
    abstract: '',
    objectives: [
      'Develop scalable quantum error-correction protocols that reduce qubit overhead by at least 50%.',
      'Demonstrate entanglement distribution across a 100-km fiber network using quantum repeaters.',
      'Open-source a simulator and benchmarking suite for hybrid quantum-classical algorithms.',
    ],
    eligibilityRequirements: [
      'Quantum Computing Track Record: Published breakthroughs or prototypes in quantum hardware, algorithms, or networking within the last five years.',
      'Interdisciplinary Collaboration: Active partnerships with at least one academic lab and one industry group engaged in quantum technologies.',
      'Open Science Commitment: Willingness to publish intermediate results and datasets under permissive licenses.',
    ],
    opensDate: new Date().toISOString(),
    topics: [
      {
        id: 1,
        name: 'Quantum Computing',
        slug: 'quantum-computing',
      },
    ],
    formats: [],
    figures: [],
    metrics: {
      votes: 256,
      comments: 12,
      saves: 8,
    },
    note: {
      id: 1,
      access: 'PRIVATE',
      organization: {
        id: 1,
        coverImage: null,
        name: 'Quantum Research Foundation',
        slug: 'quantum-research-foundation',
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      title: 'Grant Expectations',
      isRemoved: false,
      post: null,
      plainText:
        'Recipients are expected to publish monthly progress reports and share data openly with the community.',
      versionId: 1,
      versionDate: new Date().toISOString(),
      contentJson: '{}',
      content: '',
    },
  } as unknown as Work,
  metadata: {
    id: 999,
    score: 256,
    topics: [
      {
        id: 1,
        name: 'Quantum Computing',
        slug: 'quantum-computing',
      },
    ],
    metrics: {
      votes: 256,
      comments: 12,
      saves: 8,
      reviewScore: 0,
    },
    fundraising: {
      id: 1,
      status: 'OPEN',
      goalCurrency: 'USD',
      goalAmount: {
        usd: 250000,
        rsc: 0,
      },
      amountRaised: {
        usd: 0,
        rsc: 18500,
      },
      startDate: new Date().toISOString(),
      endDate: futureDate.toISOString(),
      contributors: {
        numContributors: 42,
        topContributors: [],
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    },
    bounties: [],
    openBounties: 0,
    closedBounties: 0,
  },
};

const mockGrant2: GrantWithMetadata = {
  work: {
    id: 1000,
    type: 'funding_request',
    contentType: 'funding_request',
    title: 'Climate Change AI Research Initiative',
    slug: 'climate-change-ai-research',
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    authors: [
      {
        authorProfile: {
          id: 3,
          fullName: 'Katherine Johnson',
          firstName: 'Katherine',
          lastName: 'Johnson',
          profileImage: '',
          headline: 'Applied Mathematician',
          profileUrl: '#',
          isClaimed: false,
          user: {
            isVerified: true,
          },
        },
        isCorresponding: true,
        position: 'first',
      },
      {
        authorProfile: {
          id: 4,
          fullName: 'Yann LeCun',
          firstName: 'Yann',
          lastName: 'LeCun',
          profileImage: '',
          headline: 'AI Researcher',
          profileUrl: '#',
          isClaimed: false,
          user: {
            isVerified: true,
          },
        },
        isCorresponding: false,
        position: 'last',
      },
    ],
    abstract: '',
    objectives: [
      'Develop machine learning models to predict extreme weather events with 90% accuracy.',
      'Create an open dataset of climate variables from satellite imagery spanning 50 years.',
      'Design automated early warning systems for coastal communities facing sea-level rise.',
      'Establish partnerships with 10+ meteorological agencies for real-time data sharing.',
    ],
    eligibilityRequirements: [
      'AI/ML Expertise: Demonstrated experience in deep learning, computer vision, or time-series analysis with climate data.',
      'Climate Science Background: Collaboration with atmospheric scientists, oceanographers, or environmental researchers.',
      'Data Infrastructure: Access to high-performance computing resources and experience with large-scale data processing.',
      'Community Impact: Commitment to deploying solutions in vulnerable communities and measuring real-world outcomes.',
    ],
    opensDate: new Date().toISOString(),
    topics: [
      {
        id: 2,
        name: 'Climate Science',
        slug: 'climate-science',
      },
      {
        id: 3,
        name: 'Artificial Intelligence',
        slug: 'artificial-intelligence',
      },
    ],
    formats: [],
    figures: [],
    metrics: {
      votes: 189,
      comments: 8,
      saves: 15,
    },
    note: {
      id: 2,
      access: 'PRIVATE',
      organization: {
        id: 2,
        coverImage: null,
        name: 'Global Climate Foundation',
        slug: 'global-climate-foundation',
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      title: 'Grant Expectations',
      isRemoved: false,
      post: null,
      plainText:
        'Funded projects must prioritize open science practices and demonstrate measurable environmental impact within 18 months.',
      versionId: 1,
      versionDate: new Date().toISOString(),
      contentJson: '{}',
      content: '',
    },
  } as unknown as Work,
  metadata: {
    id: 1000,
    score: 189,
    topics: [
      {
        id: 2,
        name: 'Climate Science',
        slug: 'climate-science',
      },
      {
        id: 3,
        name: 'Artificial Intelligence',
        slug: 'artificial-intelligence',
      },
    ],
    metrics: {
      votes: 189,
      comments: 8,
      saves: 15,
      reviewScore: 0,
    },
    fundraising: {
      id: 2,
      status: 'OPEN',
      goalCurrency: 'USD',
      goalAmount: {
        usd: 500000,
        rsc: 0,
      },
      amountRaised: {
        usd: 0,
        rsc: 12300,
      },
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
      contributors: {
        numContributors: 28,
        topContributors: [],
      },
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    },
    bounties: [],
    openBounties: 0,
    closedBounties: 0,
  },
};

// Store with all mock grants
export const mockGrants: GrantWithMetadata[] = [mockGrant1, mockGrant2];

// Helper functions
export const getGrantById = (id: number): GrantWithMetadata | undefined => {
  return mockGrants.find((grant) => grant.work.id === id);
};

export const getOpenGrants = (): GrantWithMetadata[] => {
  return mockGrants.filter((grant) => grant.metadata.fundraising?.status === 'OPEN');
};

export const getClosedGrants = (): GrantWithMetadata[] => {
  return mockGrants.filter((grant) => grant.metadata.fundraising?.status === 'CLOSED');
};

// Default export for backwards compatibility
export const defaultMockGrant = mockGrant1;
