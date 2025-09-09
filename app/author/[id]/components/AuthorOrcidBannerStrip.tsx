'use client';

import { useParams } from 'next/navigation';
import { OrcidSyncBanner } from '@/components/banners/OrcidSyncBanner';
import { useUser } from '@/contexts/UserContext';

export default function AuthorOrcidBannerStrip() {
  const { user } = useUser();
  const params = useParams<{ id: string }>(); // next/navigation
  const routeAuthorId = params?.id?.toString();
  const viewerAuthorId = user?.authorProfile?.id?.toString();
  const isOwnProfile = routeAuthorId && viewerAuthorId && routeAuthorId === viewerAuthorId;

  if (!isOwnProfile) return null;

  return (
    <div className="mb-6">
      <OrcidSyncBanner />
    </div>
  );
}
