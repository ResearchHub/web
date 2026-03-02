import { TemplateFormContent } from '../components/TemplateFormContent';

interface TemplateDetailPageProps {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { templateId } = await params;
  return <TemplateFormContent templateId={templateId} />;
}
