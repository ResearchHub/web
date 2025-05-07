import { PageLayout } from '@/app/layouts/PageLayout';
import { GrantRightSidebar } from '@/components/work/GrantRightSidebar';
import { GrantDocument } from '@/components/work/GrantDocument';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Suspense } from 'react';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';

// --- Mock data -------------------------------------------------------------

const mockWork = {
  id: 999,
  type: 'funding_request',
  contentType: 'funding_request',
  title: 'Demo Quantum Computing Research Grant',
  slug: 'demo',
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
    'Develop scalable quantum error-correction protocols that reduce qubit overhead by at least 50 %.',
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
      name: 'Demo Org',
      slug: 'demo-org',
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
} as unknown as Work;

const mockMetadata: WorkMetadata = {
  id: 999,
  score: 256,
  topics: mockWork.topics,
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
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
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
};

// ---------------------------------------------------------------------------

export default function DemoGrantPage() {
  return (
    <PageLayout rightSidebar={<GrantRightSidebar work={mockWork} metadata={mockMetadata} />}>
      <Suspense>
        <GrantDocument work={mockWork} metadata={mockMetadata} defaultTab="paper" />
        <SearchHistoryTracker work={mockWork} />
      </Suspense>
    </PageLayout>
  );
}
