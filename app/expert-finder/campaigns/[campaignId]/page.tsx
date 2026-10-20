import { CampaignDetailContent } from './components/CampaignDetailContent';

interface CampaignDetailPageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params;
  return <CampaignDetailContent campaignId={campaignId} />;
}
