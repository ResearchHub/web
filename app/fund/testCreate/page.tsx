'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { CreateGrantButton } from '@/components/Grant/CreateGrantButton';
import { GrantPublishModal } from '@/components/Grant/GrantPublishModal';
import { useUser } from '@/contexts/UserContext';
import { useUserGrants, UserGrant } from '@/hooks/useUserGrants';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';

export default function GrantManagementPage() {
  const searchParams = useSearchParams();
  const { user } = useUser();

  const overrideUserId = searchParams.get('user_id');
  const effectiveUserId = overrideUserId ? Number(overrideUserId) : user?.id;

  const { grants, isLoading, refetch } = useUserGrants(effectiveUserId);

  const [editingGrant, setEditingGrant] = useState<UserGrant | null>(null);

  return (
    <PageLayout rightSidebar={false}>
      <MainPageHeader
        icon={<Icon name="solidHand" size={26} color="#3971ff" />}
        title="Funding Marketplace"
        subtitle="Participate in funding the future of science"
        showTitle={false}
      />

      <div className="flex items-center gap-2 border-b border-gray-200 px-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        ) : (
          grants.map((grant) => (
            <GrantTab
              key={grant.postId}
              label={grant.title || 'Untitled RFP'}
              isActive={editingGrant?.postId === grant.postId}
              onClick={() => setEditingGrant(grant)}
            />
          ))
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        {!isLoading && grants.length === 0 && (
          <p className="text-sm text-gray-500">No RFPs found. Create one to get started.</p>
        )}
        <CreateGrantButton />
      </div>

      <GrantPublishModal
        isOpen={!!editingGrant}
        onClose={() => setEditingGrant(null)}
        postId={editingGrant?.postId}
        onSaved={() => {
          setEditingGrant(null);
          refetch();
        }}
      />
    </PageLayout>
  );
}

interface GrantTabProps {
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function GrantTab({ label, isActive, onClick }: GrantTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      {label}
    </button>
  );
}
