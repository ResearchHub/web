import { Metadata } from 'next';
import { AuthorService } from '@/services/author.service';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { buildProfileSEOMeta } from '@/lib/structured-data';
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
    const profileUrl = `/author/${id}`;
    const profileImage = user.authorProfile?.profileImage;
    const base = buildOpenGraphMetadata({
      title: headline ? `${name} | ${headline}` : name,
      description: about || `View ${name}'s research contributions on ResearchHub.`,
      url: profileUrl,
      image: profileImage,
      type: 'profile',
    });

    return {
      ...base,
      other: buildProfileSEOMeta({
        name,
        firstName,
        lastName,
        url: profileUrl,
        image: profileImage,
        headline,
        description: about,
      }),
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
