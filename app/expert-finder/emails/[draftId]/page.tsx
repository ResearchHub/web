import { TemplateFormContent } from '@/app/expert-finder/templates/components/TemplateFormContent';

interface DraftDetailPageProps {
  params: Promise<{ draftId: string }>;
}

export default async function DraftDetailPage({ params }: DraftDetailPageProps) {
  const { draftId } = await params;
  return <TemplateFormContent templateId={draftId} />;
}
