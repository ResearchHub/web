import { OutreachDetailPageContent } from '@/app/expert-finder/outreach/[emailId]/OutreachDetailPageContent';

interface LibraryOutreachDetailPageProps {
  params: Promise<{ searchId: string; emailId: string }>;
}

export default async function LibraryOutreachDetailPage({
  params,
}: LibraryOutreachDetailPageProps) {
  const { searchId, emailId } = await params;
  return (
    <OutreachDetailPageContent
      emailId={emailId}
      breadcrumbVariant="library"
      librarySearchId={searchId}
    />
  );
}
