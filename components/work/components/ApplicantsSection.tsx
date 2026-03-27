'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorProfile } from '@/types/authorProfile';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

interface ApplicantsSectionProps {
  applicants?: AuthorProfile[];
}

export const ApplicantsSection: FC<ApplicantsSectionProps> = ({ applicants = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasApplicants = applicants.length > 0;
  const displayLimit = 5;
  const displayedApplicants = isExpanded ? applicants : applicants.slice(0, displayLimit);
  const hasMoreApplicants = applicants.length > displayLimit;

  return (
    <section>
      <SidebarHeader title="Applicants" className="mb-3" />

      {hasApplicants ? (
        <>
          <div className="space-y-3">
            {displayedApplicants.map((applicant, index) => (
              <div key={`${applicant.id}-${index}`} className="flex items-center gap-2">
                <Avatar
                  src={applicant.profileImage || ''}
                  alt={applicant.fullName}
                  size="xs"
                  authorId={applicant.id}
                />
                <Link
                  href={`/author/${applicant.id}`}
                  className="text-sm font-medium text-gray-900 truncate hover:text-blue-600"
                >
                  {applicant.fullName}
                </Link>
              </div>
            ))}
          </div>

          {hasMoreApplicants && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-500 mt-3 hover:text-primary-600 hover:underline"
            >
              {isExpanded ? 'Show less' : `+${applicants.length - displayLimit} more applicants`}
            </button>
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
