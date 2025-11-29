import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TopicFeedPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Redirect to popular tab by default
  redirect(`/topic/${slug}/popular`);
}
