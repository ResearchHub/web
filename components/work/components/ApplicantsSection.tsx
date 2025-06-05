'use client';

import { FC } from 'react';
import { Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorProfile } from '@/types/authorProfile';

interface ApplicantsSectionProps {
  applicants?: AuthorProfile[];
}

export const ApplicantsSection: FC<ApplicantsSectionProps> = ({ applicants = [] }) => {
  const hasApplicants = applicants.length > 0;
  const displayLimit = 5; // Show only top 5 applicants in the sidebar
  const displayedApplicants = applicants.slice(0, displayLimit);
  const hasMoreApplicants = applicants.length > displayLimit;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Users size={22} className="text-gray-600" />
        <h3 className="text-base font-semibold text-gray-900">Applicants</h3>
      </div>

      {hasApplicants ? (
        <>
          <div className="space-y-3">
            {displayedApplicants.map((applicant, index) => (
              <div key={`${applicant.id}-${index}`} className="flex items-center gap-2">
                <Avatar src={applicant.profileImage || ''} alt={applicant.fullName} size="xs" />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {applicant.fullName}
                </span>
              </div>
            ))}
          </div>

          {hasMoreApplicants && (
            <p className="text-sm text-gray-500 mt-3">
              +{applicants.length - displayedApplicants.length} more applicants
            </p>
          )}
        </>
      ) : (
        <div className="py-1">
          <p className="text-sm text-gray-500">No applicants yet</p>
        </div>
      )}
    </section>
  );
};
