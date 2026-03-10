import { OutreachDetailPageContent } from './OutreachDetailPageContent';

interface LibraryOutreachDetailPageProps {
  params: Promise<{ searchId: string; emailId: string }>;
}

export default async function LibraryOutreachDetailPage({
  params,
}: LibraryOutreachDetailPageProps) {
  const { searchId, emailId } = await params;
  return <OutreachDetailPageContent emailId={emailId} librarySearchId={searchId} />;
}
