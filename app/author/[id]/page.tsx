'use client'

import { PageLayout } from '@/app/layouts/PageLayout'
import { ProfileRightSidebar } from '@/app/components/profile/ProfileRightSidebar'
import { FeedItem } from '@/app/components/FeedItem'
import { Pin, BadgeCheck } from 'lucide-react'

type AuthorProfileProps = {
  params: {
    id: string
  }
}

export default function AuthorProfile({ params }: AuthorProfileProps) {
  // Mock data for bioRxiv profile
  const profile = {
    id: 'biorxiv',
    name: 'bioRxiv (Cold Spring Harbor Laboratory)',
    headline: 'The preprint server for biology',
    organization: true,
    verified: true,
    avatar: null,
    stats: {
      publications: 245789,
      citations: 892345,
      hIndex: 892,
      works: 298456
    },
    topics: [
      'Molecular Biology',
      'Genetics',
      'Cell Biology',
      'Neuroscience',
      'Immunology',
      'Bioinformatics'
    ],
    keywords: [
      'Preprints',
      'Open Science',
      'Peer Review',
      'Scientific Publishing',
      'Research Dissemination'
    ],
    links: {
      homepage: 'https://www.biorxiv.org',
      twitter: 'https://twitter.com/biorxiv',
      ror: 'https://ror.org/04z8jg394',
      crossref: 'https://crossref.org/biorxiv'
    }
  }

  // Mock feed items with pinned funding request
  const feedItems = [
    {
      type: 'funding_request',
      is_pinned: true,
      user: profile.name,
      organization: true,
      verified: true,
      timestamp: 'Dec 1, 2024',
      hub: { name: 'Research Infrastructure', slug: 'research-infrastructure' },
      title: 'bioRxiv 2025 Operational Costs',
      description: 'Support bioRxiv\'s mission to accelerate scientific communication. Funds will be used for server infrastructure, development of new features, and maintaining our commitment to free preprint hosting for the scientific community.',
      amount: '892,450',
      goal: '2,500,000',
      progress: 35,
      votes: 1243,
      comments: 89,
      contributors: 892,
      contributorAvatars: [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
      ],
      topContributors: [
        { name: 'Howard Hughes Medical Institute', amount: '250,000', verified: true, organization: true },
        { name: 'Chan Zuckerberg Initiative', amount: '200,000', verified: true, organization: true },
        { name: 'Wellcome Trust', amount: '150,000', verified: true, organization: true },
      ]
    },
    {
      type: 'publish',
      user: profile.name,
      organization: true,
      verified: true,
      timestamp: 'Oct 18, 2024',
      hub: { name: 'Molecular Biology', slug: 'molecular-biology' },
      title: 'Structural basis of mRNA cap modification by SARS-CoV-2 nsp14-nsp10',
      description: 'The SARS-CoV-2 nsp14-nsp10 complex plays a crucial role in viral mRNA cap modification. Here we present the cryo-EM structure of this complex, revealing novel insights into the mechanism of RNA capping in coronaviruses.',
      authors: [
        { name: "Sarah Chen", verified: true },
        { name: "David Wang", verified: true },
        { name: "Maria Garcia", verified: false }
      ],
      votes: 156,
      comments: 23
    },
    // Add more feed items as needed...
  ]

  return (
    <PageLayout rightSidebar={<ProfileRightSidebar />}>
      <div>
        {/* Profile header */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            {profile.verified && profile.organization && (
              <BadgeCheck className="h-6 w-6 text-yellow-500" />
            )}
          </div>
          <p className="text-gray-600 mt-1">{profile.headline}</p>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {feedItems.map((item, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 
                ${item.is_pinned ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100'}`}
            >
              {item.is_pinned && (
                <div className="px-6 pt-4 pb-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Pin className="w-3.5 h-3.5" />
                    Pinned
                  </span>
                </div>
              )}
              <FeedItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
} 