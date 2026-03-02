import { OutreachDetailPageContent } from './OutreachDetailPageContent';

interface OutreachDetailPageProps {
  params: Promise<{ emailId: string }>;
}

export default async function OutreachDetailPage({ params }: OutreachDetailPageProps) {
  const { emailId } = await params;
  return <OutreachDetailPageContent emailId={emailId} />;
}
