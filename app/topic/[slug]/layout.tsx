import { Metadata } from 'next';
import { HubService } from '@/services/hub.service';
import { buildOpenGraphMetadata } from '@/lib/metadata';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const topic = await HubService.getHubBySlug(slug);
    return buildOpenGraphMetadata({
      title: topic.name,
      description:
        topic.description ||
        `Explore ${topic.name} research papers and discussions on ResearchHub.`,
      url: `/topic/${slug}`,
      image: topic.imageUrl,
    });
  } catch {
    return {};
  }
}

export default function TopicLayout({ children }: Props) {
  return children;
}
