'use client';

import { useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedContent } from '@/components/Feed/FeedContent';
import { BioScienceRightSidebar } from '@/components/Hub/BioScienceRightSidebar';
import { JournalHighlightsCarousel } from '@/components/Hub/JournalHighlightsCarousel';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { BookOpen, Sparkles, Users } from 'lucide-react';
import { FeedEntry } from '@/types/feed';
import Link from 'next/link';

type BioScienceTab = 'all-submissions' | 'in-review' | 'published';

// Mock data for Journal Highlights - featured/pinned content
const mockJournalHighlights: FeedEntry[] = [
  {
    id: 'highlight-1',
    timestamp: '2024-01-16T08:00:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 9500001,
      contentType: 'PAPER',
      createdDate: '2024-01-16T08:00:00Z',
      textPreview:
        'Revolutionary breakthrough in cancer immunotherapy using engineered CAR-T cells targeting multiple tumor antigens simultaneously. Our novel multi-targeting approach shows unprecedented 95% complete remission rates in clinical trials for previously untreatable pancreatic cancer, opening new avenues for personalized cancer treatment.',
      slug: 'revolutionary-car-t-cancer-immunotherapy',
      title:
        'Revolutionary Multi-Target CAR-T Cell Therapy Achieves 95% Remission in Pancreatic Cancer',
      authors: [
        {
          id: 101,
          fullName: 'Dr. Maria Gonzalez',
          firstName: 'Maria',
          lastName: 'Gonzalez',
          profileImage:
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
          headline: 'Cancer Immunologist & CAR-T Researcher',
          profileUrl: '/author/maria-gonzalez',
          isClaimed: true,
        },
        {
          id: 102,
          fullName: 'Dr. Robert Kim',
          firstName: 'Robert',
          lastName: 'Kim',
          profileImage:
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
          headline: 'Oncologist',
          profileUrl: '/author/robert-kim',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 11,
          name: 'Cancer Research',
          slug: 'cancer-research',
        },
        {
          id: 12,
          name: 'Immunotherapy',
          slug: 'immunotherapy',
        },
      ],
      createdBy: {
        id: 101,
        fullName: 'Dr. Maria Gonzalez',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        profileImage:
          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
        headline: 'Cancer Immunologist & CAR-T Researcher',
        profileUrl: '/author/maria-gonzalez',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 892,
      comments: 156,
      saves: 234,
    },
    highlightType: 'breakthrough',
  } as FeedEntry & { highlightType: string },
  {
    id: 'highlight-2',
    timestamp: '2024-01-15T14:30:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 9500002,
      contentType: 'PAPER',
      createdDate: '2024-01-15T14:30:00Z',
      textPreview:
        "Comprehensive meta-analysis of 50,000 patients reveals that specific gut microbiome signatures can predict Alzheimer's disease onset up to 10 years before clinical symptoms appear. This discovery enables early intervention strategies and represents a major advance in neurodegenerative disease prevention.",
      slug: 'gut-microbiome-alzheimers-prediction',
      title: "Gut Microbiome Signatures Predict Alzheimer's Disease 10 Years Before Symptoms",
      authors: [
        {
          id: 103,
          fullName: 'Dr. Jennifer Wu',
          firstName: 'Jennifer',
          lastName: 'Wu',
          profileImage:
            'https://images.unsplash.com/photo-1594824911330-82b37e8ae9ef?w=150&h=150&fit=crop&crop=face',
          headline: 'Microbiome & Neuroscience Researcher',
          profileUrl: '/author/jennifer-wu',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 13,
          name: 'Neuroscience',
          slug: 'neuroscience',
        },
        {
          id: 14,
          name: 'Microbiome',
          slug: 'microbiome',
        },
      ],
      createdBy: {
        id: 103,
        fullName: 'Dr. Jennifer Wu',
        firstName: 'Jennifer',
        lastName: 'Wu',
        profileImage:
          'https://images.unsplash.com/photo-1594824911330-82b37e8ae9ef?w=150&h=150&fit=crop&crop=face',
        headline: 'Microbiome & Neuroscience Researcher',
        profileUrl: '/author/jennifer-wu',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 1247,
      comments: 203,
      saves: 456,
    },
    highlightType: 'editors-choice',
  } as FeedEntry & { highlightType: string },
  {
    id: 'highlight-3',
    timestamp: '2024-01-14T16:45:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 9500003,
      contentType: 'PAPER',
      createdDate: '2024-01-14T16:45:00Z',
      textPreview:
        'Novel coral restoration technique using 3D-printed calcium carbonate structures and symbiotic algae cultivation shows remarkable success in reviving bleached reef ecosystems. Our method demonstrates 300% faster coral growth rates and enhanced resistance to ocean acidification.',
      slug: 'novel-coral-restoration-3d-printing',
      title: '3D-Printed Coral Restoration Achieves 300% Faster Reef Recovery Rates',
      authors: [
        {
          id: 104,
          fullName: 'Dr. Ahmed Hassan',
          firstName: 'Ahmed',
          lastName: 'Hassan',
          profileImage:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          headline: 'Marine Conservation Biologist',
          profileUrl: '/author/ahmed-hassan',
          isClaimed: true,
        },
        {
          id: 105,
          fullName: 'Dr. Lisa Thompson',
          firstName: 'Lisa',
          lastName: 'Thompson',
          profileImage:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
          headline: 'Bioengineering Specialist',
          profileUrl: '/author/lisa-thompson',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 15,
          name: 'Conservation Biology',
          slug: 'conservation-biology',
        },
        {
          id: 16,
          name: 'Bioengineering',
          slug: 'bioengineering',
        },
      ],
      createdBy: {
        id: 104,
        fullName: 'Dr. Ahmed Hassan',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        profileImage:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        headline: 'Marine Conservation Biologist',
        profileUrl: '/author/ahmed-hassan',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 658,
      comments: 89,
      saves: 178,
    },
    highlightType: 'most-cited',
  } as FeedEntry & { highlightType: string },
  {
    id: 'highlight-4',
    timestamp: '2024-01-13T11:20:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 9500004,
      contentType: 'PAPER',
      createdDate: '2024-01-13T11:20:00Z',
      textPreview:
        'Groundbreaking discovery of photosynthetic mechanisms in deep-sea organisms reveals new possibilities for sustainable energy production. These organisms convert chemical energy with 95% efficiency, potentially revolutionizing renewable energy technologies.',
      slug: 'deep-sea-photosynthesis-energy-production',
      title: 'Deep-Sea Organisms Unlock 95% Efficient Energy Conversion for Renewable Technologies',
      authors: [
        {
          id: 106,
          fullName: 'Dr. Yuki Tanaka',
          firstName: 'Yuki',
          lastName: 'Tanaka',
          profileImage:
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
          headline: 'Marine Biochemist',
          profileUrl: '/author/yuki-tanaka',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 17,
          name: 'Marine Biology',
          slug: 'marine-biology',
        },
        {
          id: 18,
          name: 'Renewable Energy',
          slug: 'renewable-energy',
        },
      ],
      createdBy: {
        id: 106,
        fullName: 'Dr. Yuki Tanaka',
        firstName: 'Yuki',
        lastName: 'Tanaka',
        profileImage:
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        headline: 'Marine Biochemist',
        profileUrl: '/author/yuki-tanaka',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 445,
      comments: 67,
      saves: 123,
    },
    highlightType: 'trending',
  } as FeedEntry & { highlightType: string },
];

// Mock data for BioScience papers
const mockBioScienceFeed: FeedEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 9400001,
      contentType: 'PAPER',
      createdDate: '2024-01-15T10:30:00Z',
      textPreview:
        'This study investigates the role of CRISPR-Cas9 gene editing in treating inherited retinal diseases. We demonstrate successful correction of mutations in patient-derived retinal organoids, showing restored protein function and improved cellular health. Our findings suggest potential therapeutic applications for previously untreatable genetic blindness conditions.',
      slug: 'demo/bounties',
      title: 'CRISPR-Cas9 Gene Editing Shows Promise for Treating Inherited Retinal Diseases',
      authors: [
        {
          id: 1,
          fullName: 'Dr. Sarah Chen',
          firstName: 'Sarah',
          lastName: 'Chen',
          profileImage:
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
          headline: 'Ophthalmologist & Gene Therapy Researcher',
          profileUrl: '/author/sarah-chen',
          isClaimed: true,
        },
        {
          id: 2,
          fullName: 'Dr. Michael Rodriguez',
          firstName: 'Michael',
          lastName: 'Rodriguez',
          profileImage:
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
          headline: 'Molecular Biologist',
          profileUrl: '/author/michael-rodriguez',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 1,
          name: 'Gene Therapy',
          slug: 'gene-therapy',
        },
        {
          id: 2,
          name: 'Ophthalmology',
          slug: 'ophthalmology',
        },
      ],
      createdBy: {
        id: 1,
        fullName: 'Dr. Sarah Chen',
        firstName: 'Sarah',
        lastName: 'Chen',
        profileImage:
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        headline: 'Ophthalmologist & Gene Therapy Researcher',
        profileUrl: '/author/sarah-chen',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 156,
      comments: 23,
      saves: 45,
    },
  },
  {
    id: '2',
    timestamp: '2024-01-14T14:20:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 2,
      contentType: 'PAPER',
      createdDate: '2024-01-14T14:20:00Z',
      textPreview:
        'Climate change is accelerating ecosystem transformations worldwide. Our comprehensive analysis of 50 years of ecological data reveals unprecedented shifts in species distributions, with implications for biodiversity conservation. We propose adaptive management strategies to help ecosystems maintain resilience under changing environmental conditions.',
      slug: 'climate-change-ecosystem-transformations',
      title: 'Ecosystem Transformations Under Climate Change: A 50-Year Analysis',
      authors: [
        {
          id: 3,
          fullName: 'Dr. Elena Vasquez',
          firstName: 'Elena',
          lastName: 'Vasquez',
          profileImage:
            'https://images.unsplash.com/photo-1594824911330-82b37e8ae9ef?w=150&h=150&fit=crop&crop=face',
          headline: 'Climate Ecologist',
          profileUrl: '/author/elena-vasquez',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 3,
          name: 'Climate Change',
          slug: 'climate-change',
        },
        {
          id: 4,
          name: 'Ecology',
          slug: 'ecology',
        },
      ],
      createdBy: {
        id: 3,
        fullName: 'Dr. Elena Vasquez',
        firstName: 'Elena',
        lastName: 'Vasquez',
        profileImage:
          'https://images.unsplash.com/photo-1594824911330-82b37e8ae9ef?w=150&h=150&fit=crop&crop=face',
        headline: 'Climate Ecologist',
        profileUrl: '/author/elena-vasquez',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 234,
      comments: 41,
      saves: 67,
    },
  },
  {
    id: '3',
    timestamp: '2024-01-13T09:15:00Z',
    action: 'publish',
    contentType: 'PAPER',
    content: {
      id: 3,
      contentType: 'PAPER',
      createdDate: '2024-01-13T09:15:00Z',
      textPreview:
        'Marine microplastics pose significant threats to ocean ecosystems. Our study examines the bioaccumulation of microplastics in marine food webs, revealing concerning concentrations in commercially important fish species. We present novel filtration technologies and policy recommendations to mitigate plastic pollution.',
      slug: 'microplastics-marine-food-webs',
      title: 'Microplastic Bioaccumulation in Marine Food Webs: Solutions for a Growing Crisis',
      authors: [
        {
          id: 4,
          fullName: 'Dr. James Liu',
          firstName: 'James',
          lastName: 'Liu',
          profileImage:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          headline: 'Marine Biologist',
          profileUrl: '/author/james-liu',
          isClaimed: true,
        },
        {
          id: 5,
          fullName: 'Dr. Amanda Foster',
          firstName: 'Amanda',
          lastName: 'Foster',
          profileImage:
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
          headline: 'Environmental Scientist',
          profileUrl: '/author/amanda-foster',
          isClaimed: true,
        },
      ],
      topics: [
        {
          id: 5,
          name: 'Marine Biology',
          slug: 'marine-biology',
        },
        {
          id: 6,
          name: 'Environmental Science',
          slug: 'environmental-science',
        },
      ],
      createdBy: {
        id: 4,
        fullName: 'Dr. James Liu',
        firstName: 'James',
        lastName: 'Liu',
        profileImage:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        headline: 'Marine Biologist',
        profileUrl: '/author/james-liu',
        isClaimed: true,
      },
      journal: {
        id: 1,
        name: 'BioScience',
        slug: 'bioscience',
        description: 'Leading journal in biological sciences',
      },
      workType: 'published',
    },
    metrics: {
      votes: 189,
      comments: 32,
      saves: 54,
    },
  },
];

export default function BioScienceHubPage() {
  const [activeTab, setActiveTab] = useState<BioScienceTab>('all-submissions');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as BioScienceTab);
  };

  const handleLoadMore = () => {
    // TODO: Implement actual load more functionality
    console.log('Load more clicked');
  };

  const tabs = [
    { id: 'all-submissions', label: 'All Submissions' },
    { id: 'in-review', label: 'In Review' },
    { id: 'published', label: 'Published' },
  ];

  const header = (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
          🧬
        </div>
        <div>
          <h1 className="text-3xl font-bold">BioScience</h1>
          <p className="text-green-100 text-lg">Leading Research in Biological Sciences</p>
        </div>
        <div className="ml-auto px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full shadow-sm">
          <BookOpen className="h-3 w-3 inline mr-1" />
          Journal
        </div>
      </div>
      <p className="text-green-50 max-w-3xl">
        Advancing scientific understanding of living systems through rigorous research, innovative
        methodologies, and collaborative discovery. Join our community of leading researchers
        shaping the future of biological sciences.
      </p>
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>2,847 members</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>489 publications</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Impact Factor: 9.2</span>
        </div>
      </div>
    </div>
  );

  // Banner components based on active tab
  const getTabBanner = () => {
    if (activeTab === 'in-review') {
      return (
        <div className="bg-[#fff9e6] border-l-4 border-[#dc9814] p-6 relative mb-8">
          <div className="absolute left-6 top-9">
            <span className="h-2 w-2 rounded-full bg-[#dc9814] block"></span>
          </div>
          <div className="ml-5">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              The following preprints have been submitted and are currently under review.
            </h1>
            <p className="text-gray-600 text-sm">
              Help advance scientific knowledge by participating in our peer review process.
            </p>
          </div>
          <div className="mt-6 ml-5">
            <Link
              href="https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-4 py-2 bg-[#dc9814] text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center">
                Become a Peer Reviewer
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      );
    } else if (activeTab === 'published') {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 relative mb-8">
          <div className="absolute left-6 top-9">
            <span className="h-2 w-2 rounded-full bg-green-500 block"></span>
          </div>
          <div className="ml-5">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              The following papers have been peer reviewed and approved by our editorial team.
            </h1>
            <p className="text-gray-600 text-sm">
              These works have successfully completed our rigorous peer review process.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const feedTabs = <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />;

  const tabBanner = getTabBanner();

  return (
    <PageLayout rightSidebar={<BioScienceRightSidebar />} maxWidth="wide">
      <div className="max-w-4xl mx-auto">{header}</div>
      <div className="max-w-4xl mx-auto">
        <JournalHighlightsCarousel highlights={mockJournalHighlights} />
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="border-b">{feedTabs}</div>
        {tabBanner && <div className="mt-6">{tabBanner}</div>}
      </div>
      <FeedContent
        entries={mockBioScienceFeed}
        isLoading={isLoading}
        hasMore={true}
        loadMore={handleLoadMore}
        activeTab={activeTab as any}
        disableCardLinks={false}
        maxLength={300}
      />
    </PageLayout>
  );
}
