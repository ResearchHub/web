import { redirect } from 'next/navigation';
import { DEFAULT_PENDING_MODULE, moduleToSlug } from '@/services/content-moderation.service';

export default function PendingWorksPage() {
  redirect(`/moderators/pending-works/${moduleToSlug(DEFAULT_PENDING_MODULE)}`);
}
