import { Metadata } from 'next';
import { AuthorService } from '@/services/author.service';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await AuthorService.getAuthorInfo(Number(id));
    const name = user.authorProfile?.fullName || 'Researcher';
    const headline = user.authorProfile?.headline;
    return buildOpenGraphMetadata({
      title: name,
      description: headline || `View ${name}'s research contributions on ResearchHub.`,
      url: `/author/${id}`,
      image: user.authorProfile?.profileImage,
      type: 'profile',
    });
  } catch {
    return {};
  }
}

export default function AuthorProfileLayout({ children }: Props) {
  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
