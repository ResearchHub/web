import {
  FeedEntry,
  transformFeedEntry,
  RawApiFeedEntry,
  FeedPostContent,
  FeedPaperContent,
} from '@/types/feed';
import { authors as authorSuggestions } from './authorStore';
import { hubs } from './hubStore';
import { AuthorProfile } from '@/types/authorProfile';

// Helper to map AuthorSuggestion to the structure expected by RawApiFeedEntry['author']
const mapAuthorToRaw = (author: AuthorProfile | undefined) => {
  if (!author) return undefined;
  return {
    id: author.id,
    first_name: author.firstName,
    last_name: author.lastName,
    profile_image: author.profileImage,
    headline: author.headline,
    // Add other fields if needed by transformFeedEntry or its consumers
  };
};

const author6 = authorSuggestions.find((a) => a.id === 6);
const author3 = authorSuggestions.find((a) => a.id === 3);
const author7 = authorSuggestions.find((a) => a.id === 7);

// Sample Raw Feed Entries (modify structure based on actual API)
const rawLongevityEntries: Partial<RawApiFeedEntry>[] = [
  {
    id: 3001,
    content_type: 'POST',
    content_object: {
      id: 101,
      title: 'Welcome to the Stanford Longevity Lab Hub!',
      slug: 'welcome-longevity-lab',
      created_by: author6,
      created_date: '2024-05-10T10:00:00Z',
      preview_image:
        'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80', // Relevant image
      post_type: 'DISCUSSION', // Example field, adjust as needed
      text_preview:
        'Join the discussion on the latest research in healthy aging, cellular senescence, and interventions to extend healthspan. Share your insights and questions!',
      authors: [author6].filter((a) => !!a),
      hubs: [hubs.environmentalScience], // Link to Stanford Longevity Lab hub
    },
    created_date: '2024-05-10T10:05:00Z',
    action: 'post',
    action_date: '2024-05-10T10:00:00Z',
    author: mapAuthorToRaw(author6),
    metrics: { votes: 45, replies: 3 },
  },
  {
    id: 3002,
    content_type: 'PAPER',
    content_object: {
      id: 95001,
      title: 'Caloric Restriction Mimetics: Progress and Potential',
      slug: 'caloric-restriction-mimetics-progress',
      authors: [author3].filter((a) => !!a),
      hub: hubs.environmentalScience, // Link to Stanford Longevity Lab hub
      created_date: '2024-05-09T14:30:00Z',
      abstract:
        'This review explores compounds that mimic the metabolic and physiological effects of caloric restriction, potentially promoting longevity and healthspan without requiring dietary changes...',
      work_type: 'published',
      journal: { id: 201, name: 'Aging Cell', slug: 'aging-cell' },
    },
    created_date: '2024-05-09T14:35:00Z',
    action: 'publish',
    action_date: '2024-05-09T14:30:00Z',
    author: mapAuthorToRaw(author3),
    metrics: { votes: 112, replies: 15 },
  },
  {
    id: 3003,
    content_type: 'POST',
    content_object: {
      id: 102,
      title: 'Upcoming Seminar: AI in Longevity Research',
      slug: 'seminar-ai-longevity',
      created_by: author7,
      created_date: '2024-05-11T09:00:00Z',
      text_preview:
        'Join us next Tuesday for a seminar exploring how artificial intelligence is accelerating discoveries in aging research. Speaker: Dr. Alex Thompson from DeepMind Health.',
      authors: [author7].filter((a) => !!a),
      hubs: [hubs.environmentalScience],
    },
    created_date: '2024-05-11T09:05:00Z',
    action: 'post',
    action_date: '2024-05-11T09:00:00Z',
    author: mapAuthorToRaw(author7),
    metrics: { votes: 28, replies: 1 },
  },
];

// Transform raw entries into FeedEntry format
// NOTE: transformFeedEntry expects a specific structure. We might need to adjust the raw data
// or the transformer. For this mock, we'll manually construct FeedEntry.

const transformManual = (raw: any): FeedEntry | null => {
  try {
    const base: Partial<FeedEntry> = {
      id: raw.id.toString(),
      timestamp: raw.action_date,
      action: raw.action.toLowerCase() as any,
      metrics: raw.metrics,
      // raw: raw, // Optionally include raw data
    };

    if (raw.content_type === 'POST') {
      const co = raw.content_object;
      base.contentType = 'POST';
      base.content = {
        id: co.id,
        contentType: 'POST',
        createdDate: co.created_date,
        textPreview: co.text_preview,
        slug: co.slug,
        title: co.title,
        previewImage: co.preview_image,
        authors: (co.authors || []).map((a: any) => a), // Already transformed authors
        topics: (co.hubs || []).map((h: any) => ({ ...h, type: 'hub' })), // Adapt hubs to topics
        createdBy: co.created_by, // Already transformed author
      } as FeedPostContent;
    } else if (raw.content_type === 'PAPER') {
      const co = raw.content_object;
      base.contentType = 'PAPER';
      base.content = {
        id: co.id,
        contentType: 'PAPER',
        createdDate: co.created_date,
        textPreview: co.abstract,
        slug: co.slug,
        title: co.title,
        authors: (co.authors || []).map((a: any) => a),
        topics: co.hub ? [{ ...co.hub, type: 'hub' }] : [],
        createdBy: raw.author, // Use the top-level author for paper
        journal: co.journal,
        workType: co.work_type,
      } as FeedPaperContent;
    } else {
      return null; // Unsupported type for this mock
    }

    return base as FeedEntry;
  } catch (error) {
    console.error('Error transforming mock entry:', raw.id, error);
    return null;
  }
};

export const mockLongevityFeed: FeedEntry[] = rawLongevityEntries
  .map(transformManual)
  .filter((e): e is FeedEntry => e !== null);

// Define pinned entries (e.g., the Welcome post)
export const pinnedLongevityFeed: FeedEntry[] = mockLongevityFeed.filter(
  (entry) => entry.id === '3001'
);

// Define the rest of the feed
export const remainingLongevityFeed: FeedEntry[] = mockLongevityFeed.filter(
  (entry) => entry.id !== '3001'
);
