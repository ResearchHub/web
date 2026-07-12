import { notFound } from 'next/navigation';
import { PendingModerationList } from '@/components/Moderators/PendingModerationList';
import { slugToModule } from '@/services/content-moderation.service';

export default async function PendingModulePage({
  params,
}: Readonly<{ params: Promise<{ module: string }> }>) {
  const { module: slug } = await params;
  const pendingModule = slugToModule(slug);

  if (!pendingModule) {
    notFound();
  }

  return <PendingModerationList key={pendingModule} module={pendingModule} />;
}
