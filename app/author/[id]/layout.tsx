import { Metadata } from 'next';
import { AuthorService } from '@/services/author.service';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';

interface GenerateMetadataProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await AuthorService.getAuthorInfo(Number(id));
    const name = user.authorProfile?.fullName || 'Researcher';
    const firstName = user.authorProfile?.firstName;
    const lastName = user.authorProfile?.lastName;
    const headline = user.authorProfile?.headline;
    const about = user.authorProfile?.description;
    const base = buildOpenGraphMetadata({
      title: headline ? `${name} | ${headline}` : name,
      description: about || `View ${name}'s research contributions on ResearchHub.`,
      url: `/author/${id}`,
      image: user.authorProfile?.profileImage,
      type: 'profile',
    });
    const profileMeta: Record<string, string> = {};
    if (firstName) profileMeta['profile:first_name'] = firstName;
    if (lastName) profileMeta['profile:last_name'] = lastName;
    return {
      ...base,
      ...(Object.keys(profileMeta).length > 0 && { other: profileMeta }),
    };
  } catch {
    return {};
  }
}

export default function AuthorProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
