'use client';

import { FC } from 'react';
import { Users } from 'lucide-react';
import { useFeed } from '@/hooks/useFeed';
import { Avatar } from '@/components/ui/Avatar';

interface ApplicantsSectionProps {
  grantId: number;
}

export const ApplicantsSection: FC<ApplicantsSectionProps> = ({ grantId }) => {
  const { entries, isLoading } = useFeed('all' as any, {
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    fundraiseStatus: 'OPEN',
  });

  // Extract applicant authors (assuming first author of each entry)
  const applicants = entries
    .map((entry: any) => {
      const post = entry.content;
      const author = post?.authors?.[0];
      if (!author) return null;
      return {
        id: author.id || author.authorProfile?.id,
        fullName: author.fullName || author.authorProfile?.fullName,
        profileImage: author.profileImage || author.authorProfile?.profileImage,
      };
    })
    .filter(Boolean)
    .reduce((acc: any[], curr: any) => {
      // Remove duplicates by id
      if (!acc.find((a) => a.id === curr!.id)) acc.push(curr!);
      return acc;
    }, []);

  const displayedApplicants = applicants.slice(0, 5);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3 animate-pulse">
          <Users size={18} className="text-gray-300" />
          <h3 className="text-base font-semibold text-gray-400">Applicants</h3>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center space-x-2 h-6 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} className="text-gray-700" />
        <h3 className="text-base font-semibold text-gray-900">Applicants ({applicants.length})</h3>
      </div>

      {applicants.length === 0 ? (
        <p className="text-sm text-gray-500">No applicants yet</p>
      ) : (
        <div className="space-y-3">
          {displayedApplicants.map((applicant) => (
            <div key={applicant.id} className="flex items-center gap-2">
              <Avatar src={applicant.profileImage} alt={applicant.fullName} size="xs" />
              <span className="text-sm font-medium text-gray-900 truncate">
                {applicant.fullName}
              </span>
            </div>
          ))}
          {applicants.length > displayedApplicants.length && (
            <p className="text-sm text-gray-500">
              +{applicants.length - displayedApplicants.length} more applicants
            </p>
          )}
        </div>
      )}
    </div>
  );
};
