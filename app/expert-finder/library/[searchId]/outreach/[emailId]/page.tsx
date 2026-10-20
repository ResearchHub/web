import { redirect } from 'next/navigation';
import { TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';

interface LibraryOutreachDetailPageProps {
  params: Promise<{ searchId: string; emailId: string }>;
}

/** Outreach detail is disabled for now; the outreach table is sufficient. */
export default async function LibraryOutreachDetailPage({
  params,
}: LibraryOutreachDetailPageProps) {
  const { searchId } = await params;
  redirect(`/expert-finder/library/${searchId}?tab=${TAB_OUTREACH}`);
}
