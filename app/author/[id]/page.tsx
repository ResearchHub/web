'use client'

import { PageLayout } from '@/app/layouts/PageLayout'
import { ProfileRightSidebar } from '@/components/profile/ProfileRightSidebar'
import { FeedItem } from '@/components/Feed/FeedItem'
import { Pin, BadgeCheck } from 'lucide-react'
import { FeedEntry } from '@/types/feed'
import { User } from '@/types/user'

type AuthorProfileProps = {
  params: {
    id: string
  }
}

export default function AuthorProfile({ params }: AuthorProfileProps) {
  // Mock data for bioRxiv profile
  const profile: User = {
    id: 'biorxiv',
    fullName: 'bioRxiv (Cold Spring Harbor Laboratory)',
    verified: true,
    isOrganization: true,
    isVerified: true,
  }

  // Mock feed items with pinned funding request
  const feedItems: Item[] = [
    {
      id: '1',
      type: 'funding_request',
      title: 'bioRxiv 2025 Operational Costs',
      description: 'Support bioRxiv\'s mission to accelerate scientific communication. Funds will be used for server infrastructure, development of new features, and maintaining our commitment to free preprint hosting for the scientific community.',
      user: profile,
      timestamp: 'Dec 1, 2024',
      hub: { name: 'Research Infrastructure', slug: 'research-infrastructure' },
      metrics: {
        votes: 1243,
        comments: 89,
        reposts: 0,
      },
      amount: 892450,
      goalAmount: 2500000,
      progress: 35,
      contributors: [
        {
          id: 'hhmi',
          fullName: 'Howard Hughes Medical Institute',
          verified: true,
          isOrganization: true,
          isVerified: true,
        },
        // ... other contributors
      ],
      isPinned: true,
    },
    {
      id: '2',
      type: 'paper',
      title: 'Structural basis of mRNA cap modification by SARS-CoV-2 nsp14-nsp10',
      description: 'The SARS-CoV-2 nsp14-nsp10 complex plays a crucial role in viral mRNA cap modification. Here we present the cryo-EM structure of this complex, revealing novel insights into the mechanism of RNA capping in coronaviruses.',
      user: profile,
      timestamp: 'Oct 18, 2024',
      hub: { name: 'Molecular Biology', slug: 'molecular-biology' },
      metrics: {
        votes: 156,
        comments: 23,
        reposts: 0,
      },
      authors: [
        { name: "Sarah Chen", verified: true },
        { name: "David Wang", verified: true },
        { name: "Maria Garcia", verified: false }
      ],
      doi: '10.1101/2024.10.18.123456',
      journal: 'bioRxiv'
    },
  ]

  // Create mock feed entries
  const feedEntries: FeedEntry[] = feedItems.map(item => ({
    id: item.id,
    action: 'post', // or another appropriate action
    actor: profile,
    timestamp: item.timestamp,
    item,
  }));

  return (
    <PageLayout rightSidebar={<ProfileRightSidebar />}>
      <div>
        {/* Profile header */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
            {profile.verified && profile.isOrganization && (
              <BadgeCheck className="h-6 w-6 text-yellow-500" />
            )}
          </div>
          {/* ... rest of the component ... */}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {feedEntries.map((entry, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-md shadow-sm border hover:shadow-md transition-shadow duration-200 
                ${entry.item.isPinned ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100'}`}
            >
              {entry.item.isPinned && (
                <div className="px-6 pt-4 pb-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Pin className="w-3.5 h-3.5" />
                    Pinned
                  </span>
                </div>
              )}
              <FeedItem entry={entry} />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
} 