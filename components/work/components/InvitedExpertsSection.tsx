'use client';

import { useEffect, useMemo } from 'react';
import { useDocumentInvited } from '@/hooks/useExpertFinder';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { Users } from 'lucide-react';
import type { InvitedExpert } from '@/types/expertFinder';

const INVITED_LIST_MAX = 20;

interface InvitedExpertsSectionProps {
  unifiedDocumentId: number | null | undefined;
}

export const InvitedExpertsSection = ({ unifiedDocumentId }: InvitedExpertsSectionProps) => {
  const { data, error } = useDocumentInvited(unifiedDocumentId);

  const invitedExperts = useMemo(() => {
    if (!data?.totalCount) return [];
    return data.invited.slice(0, INVITED_LIST_MAX);
  }, [data?.totalCount]);

  useEffect(() => {
    if (error) console.error('Invited experts load failed:', error);
  }, [error]);

  if (!data || data.totalCount === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-base font-semibold text-gray-900">
          Invited experts ({data.totalCount})
        </h3>
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-0">
        {invitedExperts.map((item: InvitedExpert, index: number) => {
          const authorId = item.author?.id;
          const displayName = item.author?.fullName ?? 'Unknown';

          const handleActivate = () => authorId && navigateToAuthorProfile(authorId);
          return (
            <div
              key={item.generatedEmailId ?? `${authorId}-${index}`}
              role="button"
              tabIndex={0}
              onClick={handleActivate}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleActivate();
                }
              }}
              className="grid grid-cols-[40px_1fr] gap-x-2 items-center px-1 py-2 rounded-md cursor-pointer hover:bg-gray-50"
            >
              <div className="w-10 flex-shrink-0 flex items-center">
                {authorId ? (
                  <AuthorTooltip authorId={authorId}>
                    <Avatar
                      src={item.author.profileImage}
                      alt={displayName}
                      size="sm"
                      authorId={authorId}
                    />
                  </AuthorTooltip>
                ) : (
                  <Avatar src={item.author.profileImage} alt={displayName} size="sm" />
                )}
              </div>
              <div className="min-w-0 overflow-hidden">
                {authorId ? (
                  <AuthorTooltip authorId={authorId}>
                    <span className="text-sm font-medium text-gray-900 block truncate">
                      {displayName}
                    </span>
                  </AuthorTooltip>
                ) : (
                  <span className="text-sm font-medium text-gray-900 block truncate">
                    {displayName}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
