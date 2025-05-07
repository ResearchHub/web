import { FC, useState, useMemo } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronDown } from 'lucide-react';
import { SortDropdown } from '@/components/ui/SortDropdown';
import {
  transformFeedEntry,
  RawApiFeedEntry,
  FeedEntry,
  FeedPostContent,
  ApplicationDetails,
  FeedApplicationContent,
  AuthorProfile,
} from '@/types/feed';
import { FeedItemApplication } from '@/components/Feed/items/FeedItemApplication';

interface GrantApplicationsProps {
  grantId: number;
}

// Renamed: Sample Raw API Feed Entries for Preregistrations (Hardcoded for Demo)
const rawQuantumPreregistrationEntries: RawApiFeedEntry[] = [
  {
    id: 1001, // This ID is for the RawApiFeedEntry itself
    content_type: 'RESEARCHHUBPOST',
    content_object: {
      id: 2001, // This ID is for the Preregistration content_object
      created_date: '2025-04-01T10:00:00.000000Z',
      hub: null,
      reviews: [],
      slug: 'quantum-entanglement-secure-communication',
      renderable_text:
        'This project explores the application of quantum entanglement to develop a novel secure communication system...',
      title: 'Quantum Entanglement for Secure Communication',
      type: 'PREREGISTRATION',
      institution: 'Quantum Dynamics Institute',
      authors: [
        {
          id: 201,
          first_name: 'Alice',
          last_name: 'Quantum',
          profile_image:
            'https://cvgmtisserverbisgnrgrx.supabase.co/storage/v1/object/public/images/author_profile_images/202/profile_image_228208.jpeg',
          headline: 'PhD in Quantum Physics',
          user: {
            id: 201,
            first_name: 'Alice',
            last_name: 'Quantum',
            email: 'alice.quantum@example.com',
            is_verified: true,
          },
        },
        {
          id: 203,
          first_name: 'Charles',
          last_name: 'Cipher',
          profile_image:
            'https://cvgmtisserverbisgnrgrx.supabase.co/storage/v1/object/public/images/author_profile_images/default.png',
          headline: 'Cryptography Expert',
          user: {
            id: 203,
            first_name: 'Charles',
            last_name: 'Cipher',
            email: 'charles.cipher@example.com',
            is_verified: false,
          },
        },
      ],
      fundraise: {
        id: 601,
        created_by: {
          /* Minimal created_by for fundraise, can be same as main author */ id: 201,
          author_profile: {
            id: 201,
            first_name: 'Alice',
            last_name: 'Quantum',
            profile_image: '',
            headline: { title: '' },
          },
        },
        amount_raised: { usd: 50000, rsc: 250000 },
        goal_amount: { usd: 200000, rsc: 1000000 }, // Crucial: goalAmount
        contributors: { total: 5, top: [] },
        status: 'OPEN',
        goal_currency: 'USD',
        start_date: '2025-04-01T00:00:00Z',
        end_date: '2025-06-30T23:59:59Z',
      },
    },
    created_date: '2025-04-01T10:00:00.000000Z',
    action_date: '2025-04-01T10:00:00.000000Z',
    action: 'PUBLISH',
    author: {
      /* Main author of the feed entry, Alice Quantum */ id: 201,
      first_name: 'Alice',
      last_name: 'Quantum',
      profile_image:
        'https://cvgmtisserverbisgnrgrx.supabase.co/storage/v1/object/public/images/author_profile_images/202/profile_image_228208.jpeg',
      headline: 'PhD in Quantum Physics',
      user: {
        id: 201,
        first_name: 'Alice',
        last_name: 'Quantum',
        email: 'alice.quantum@example.com',
        is_verified: true,
      },
    },
    metrics: { votes: 15, replies: 2, review_metrics: { avg: 0, count: 0 } },
    is_nonprofit: false,
  },
  {
    id: 1002,
    content_type: 'RESEARCHHUBPOST',
    content_object: {
      id: 2002, // Preregistration content_object ID
      created_date: '2025-04-05T14:30:00.000000Z',
      hub: { id: 7, name: 'Quantum Computing', slug: 'quantum-computing' },
      reviews: [],
      slug: 'superconducting-qubit-development',
      renderable_text:
        'Our team proposes to advance superconducting qubit technology, focusing on improving coherence times and gate fidelities...',
      title: 'Superconducting Qubit Development for Scalable Quantum Computers',
      type: 'PREREGISTRATION',
      institution: 'Institute for Advanced Qubit Research',
      authors: [
        {
          id: 202,
          first_name: 'Bob',
          last_name: 'Crypto',
          profile_image:
            'https://cvgmtisserverbisgnrgrx.supabase.co/storage/v1/object/public/images/author_profile_images/1/profile_image_20210706.png',
          headline: 'Professor of Experimental Physics',
          user: {
            id: 202,
            first_name: 'Bob',
            last_name: 'Crypto',
            email: 'bob.crypto@example.com',
            is_verified: true,
          },
        },
        {
          id: 204,
          first_name: 'Eve',
          last_name: 'Electronica',
          profile_image:
            'https://cvgmtisserverbisgnrgrx.supabase.co/storage/v1/object/public/images/author_profile_images/default_2.png',
          headline: 'Quantum Device Engineer',
          user: {
            id: 204,
            first_name: 'Eve',
            last_name: 'Electronica',
            email: 'eve.electronica@example.com',
            is_verified: true,
          },
        },
      ],
      fundraise: {
        id: 602,
        created_by: {
          /* Minimal created_by for fundraise */ id: 202,
          author_profile: {
            id: 202,
            first_name: 'Bob',
            last_name: 'Crypto',
            profile_image: '',
            headline: { title: '' },
          },
        },
        amount_raised: { usd: 120000, rsc: 600000 },
        goal_amount: { usd: 300000, rsc: 1500000 }, // Crucial: goalAmount
        contributors: { total: 12, top: [] },
        status: 'OPEN',
        goal_currency: 'USD',
        start_date: '2025-04-10T00:00:00Z',
        end_date: '2025-07-31T23:59:59Z',
      },
    },
    created_date: '2025-04-05T14:30:00.000000Z',
    action_date: '2025-04-05T14:30:00.000000Z',
    action: 'PUBLISH',
    author: {
      /* Main author of the feed entry, Bob Crypto */ id: 202,
      first_name: 'Bob',
      last_name: 'Crypto',
      profile_image:
        'https://cvgmtisserverbisgnrgrx.supabase.co/storage/v1/object/public/images/author_profile_images/1/profile_image_20210706.png',
      headline: 'Professor of Experimental Physics',
      user: {
        id: 202,
        first_name: 'Bob',
        last_name: 'Crypto',
        email: 'bob.crypto@example.com',
        is_verified: true,
      },
    },
    metrics: { votes: 25, replies: 5, review_metrics: { avg: 0, count: 0 } },
    is_nonprofit: false,
  },
];

// Mock data for applications
interface MockApplicationRawData {
  applicationId: number;
  preregistrationContentObjectId: number; // To link with content_object.id of a preregistration
  submissionDate: string;
  applicantUserId: number; // ID of the user submitting the application (e.g., Alice or Bob)
  objectiveAlignment: string;
  // Authors and Institution for the application can be the same as the preregistration or different
  // For this demo, we'll assume they are the same and fetch from the linked preregistration's authors/institution
}

const mockRawApplicationsData: MockApplicationRawData[] = [
  {
    applicationId: 3001,
    preregistrationContentObjectId: 2001, // Links to "Quantum Entanglement for Secure Communication"
    submissionDate: '2025-04-10T09:00:00.000000Z',
    applicantUserId: 201, // Alice Quantum
    objectiveAlignment:
      "Our quantum entanglement proposal directly addresses the funder\'s goal of pioneering next-generation secure communication technologies. By leveraging fundamental quantum principles, we aim to create a system that is inherently untappable, exceeding current cryptographic standards.",
  },
  {
    applicationId: 3002,
    preregistrationContentObjectId: 2002, // Links to "Superconducting Qubit Development"
    submissionDate: '2025-04-12T11:00:00.000000Z',
    applicantUserId: 202, // Bob Crypto
    objectiveAlignment:
      "This project on superconducting qubits is key to the funder\'s objective of advancing quantum computation. Improved qubit stability and fidelity, which are our primary focus, are critical milestones for building fault-tolerant quantum computers capable of solving currently intractable problems.",
  },
];

/**
 * Displays a list of applications (preregistrations) for a grant as a feed.
 * This is a demo component – it simply fetches the global funding feed and
 * renders each preregistration using the existing FeedItemFundraise card.
 * In the future, we can filter by `grantId` once the API supports it.
 */
export const GrantApplications: FC<GrantApplicationsProps> = ({ grantId }) => {
  const [sortBy, setSortBy] = useState<string>('personalized');

  const entries = useMemo(() => {
    try {
      // 1. Transform all raw preregistrations
      const transformedPreregistrations = rawQuantumPreregistrationEntries.map((rawEntry) =>
        transformFeedEntry(rawEntry)
      );

      // Create a map for quick lookup of transformed preregistrations by their content_object.id
      const preregistrationMap = new Map<number, FeedPostContent>();
      transformedPreregistrations.forEach((feedEntry) => {
        if (feedEntry.contentType === 'PREREGISTRATION') {
          const preregContent = feedEntry.content as FeedPostContent;
          preregistrationMap.set(preregContent.id, preregContent);
        }
      });

      // 2. Construct Application Feed Entries
      const applicationFeedEntries: FeedEntry[] = mockRawApplicationsData
        .map((appData) => {
          const linkedPrereg = preregistrationMap.get(appData.preregistrationContentObjectId);
          if (!linkedPrereg) {
            console.error(
              `Could not find preregistration with content_object.id: ${appData.preregistrationContentObjectId} for application ${appData.applicationId}`
            );
            return null; // Or handle error appropriately
          }

          // For the demo, applicant is the first author of the preregistration
          const applicantAuthor = linkedPrereg.authors[0] || ({} as AuthorProfile);

          const applicationDetails: ApplicationDetails = {
            authors: linkedPrereg.authors, // Using authors from preregistration
            institution: linkedPrereg.institution, // Using institution from preregistration
            objectiveAlignment: appData.objectiveAlignment,
          };

          const applicationContent: FeedApplicationContent = {
            id: appData.applicationId,
            contentType: 'APPLICATION',
            createdDate: appData.submissionDate,
            createdBy: applicantAuthor, // The primary applicant
            applicationDetails: applicationDetails,
            preregistration: linkedPrereg,
          };

          // Construct the final FeedEntry for the application
          return {
            id: `application-${appData.applicationId}`,
            timestamp: appData.submissionDate,
            action: 'publish', // Or a new action type like 'submit_application'
            content: applicationContent,
            contentType: 'APPLICATION',
            // Metrics, userVote etc. would typically be specific to the application item itself
            // For this demo, they can be undefined or have default values
            metrics: { votes: 0, comments: 0, saves: 0, reviewScore: 0 },
            raw: appData as any, // Store raw application data if needed
          } as FeedEntry;
        })
        .filter((entry) => entry !== null) as FeedEntry[];

      return applicationFeedEntries;
    } catch (error) {
      console.error('Error processing grant application entries:', error);
      return [];
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Row with bottom divider */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        {/* Sort dropdown (left) */}
        <SortDropdown value={sortBy} onChange={(opt) => setSortBy(opt.value)} className="w-auto" />

        {/* CTA (right) */}
        <BaseMenu
          trigger={
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Submit Application <ChevronDown className="h-4 w-4" />
            </Button>
          }
          align="end"
          sideOffset={4}
        >
          <BaseMenuItem onSelect={() => console.log('new-prereg')}>
            Add new preregistration
          </BaseMenuItem>
          <BaseMenuItem onSelect={() => console.log('submit-existing')}>
            Submit existing preregistration
          </BaseMenuItem>
        </BaseMenu>
      </div>

      {/* Render Application Feed Items */}
      {entries.map((entry) => (
        <FeedItemApplication key={entry.id} entry={entry} />
      ))}

      {/* Fallback if no entries, or if FeedContent is preferred later for loading/hasMore states */}
      {/* <FeedContent
        entries={entries}
        isLoading={false}
        hasMore={false}
        loadMore={() => {}} 
        activeTab={undefined as any} 
      /> */}
    </div>
  );
};
