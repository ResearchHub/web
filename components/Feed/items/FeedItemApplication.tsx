'use client';

import { FC } from 'react';
import { FeedEntry, FeedApplicationContent, FeedPostContent, AuthorProfile } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { AuthorList } from '@/components/ui/AuthorList';
import { Building, Users } from 'lucide-react';
import { cn } from '@/utils/styles';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { Work, AuthorPosition } from '@/types/work';

interface FeedItemApplicationProps {
  entry: FeedEntry;
}

export const FeedItemApplication: FC<FeedItemApplicationProps> = ({ entry }) => {
  const applicationContent = entry.content as FeedApplicationContent;
  const { createdBy, createdDate, applicationDetails, preregistration } = applicationContent;

  const displayAuthors = applicationDetails.authors || [createdBy];

  const preregistrationAsWork: Work = {
    ...preregistration,
    authors: preregistration.authors.map((ap, index, arr) => {
      let position: AuthorPosition;
      if (index === 0) {
        position = 'first';
      } else if (index === arr.length - 1) {
        position = 'last';
      } else {
        position = 'middle';
      }
      return {
        authorProfile: ap,
        id: ap.id,
        order: index,
        isSubmitter: createdBy.id === ap.id,
        isCorresponding: index === 0,
        position: position,
      };
    }),
    abstract: preregistration.textPreview,
    contentType: preregistration.contentType === 'PREREGISTRATION' ? 'preregistration' : 'post',
    formats: [],
    figures: [],
  } as Work;

  return (
    <div className="space-y-3">
      <FeedItemHeader
        timestamp={createdDate}
        author={createdBy}
        actionText="submitted an application"
      />
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden')}>
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Application Details:</h3>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                <AuthorList
                  authors={displayAuthors.map((a) => ({
                    name: a.fullName,
                    profileUrl: a.profileUrl,
                    verified: a.isClaimed,
                  }))}
                  size="xs"
                  delimiter=", "
                />
              </div>

              {applicationDetails.institution && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>{applicationDetails.institution}</span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                How will your research address funder's objectives?
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                {applicationDetails.objectiveAlignment}
              </p>
            </div>
          </div>

          <RelatedWorkCard
            work={preregistrationAsWork}
            fundraiseData={preregistration.fundraise}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};
