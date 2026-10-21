import { redirect } from 'next/navigation';

interface TemplateDetailPageProps {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { templateId } = await params;
  redirect(`/expert-finder/emails/${templateId}`);
}
