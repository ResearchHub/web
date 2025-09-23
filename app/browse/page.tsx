import { Metadata } from 'next';
import { groupTopicsByCategory } from '@/types/topic';
import { HubService } from '@/services/hub.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { BrowsePageClient } from './components/BrowsePageClient';
import { getBrowsePageMetadata } from '@/lib/metadata-helpers';

export async function generateMetadata(): Promise<Metadata> {
  return getBrowsePageMetadata();
}

// This tells Next.js to statically generate this page at build time
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

async function getTopics() {
  try {
    const topics = await HubService.getHubsByCategory();
    const groupedTopics = groupTopicsByCategory(topics);
    return { groupedTopics, error: null };
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    return { groupedTopics: {}, error: 'Failed to load topics' };
  }
}

export default async function BrowsePage() {
  const { groupedTopics, error } = await getTopics();

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <BrowsePageClient initialGroupedTopics={groupedTopics} />
    </PageLayout>
  );
}
