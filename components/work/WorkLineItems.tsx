'use client';

import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { Contact } from '@/types/note';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkPrimaryActions } from './WorkPrimaryActions';

interface WorkLineItemsProps {
  work: Work;
  showClaimButton?: boolean;
  insightsButton?: React.ReactNode;
  metadata: WorkMetadata;
  onEditClick?: () => void;
}

export const WorkLineItems = ({
  work,
  showClaimButton = true,
  insightsButton,
  metadata,
  onEditClick,
}: WorkLineItemsProps) => {
  return (
    <div>
      <div className="space-y-1 text-sm text-gray-600">
        {work.contentType === 'funding_request' ? (
          work.note?.post?.grant?.contacts &&
          work.note.post.grant.contacts.length > 0 && (
            <div className="flex items-center min-w-0 truncate">
              <AuthorList
                authors={work.note.post.grant.contacts.map((contact: Contact) => ({
                  name: contact.authorProfile?.fullName || contact.name,
                  verified: contact.authorProfile?.user?.isVerified,
                  profileUrl: contact.authorProfile
                    ? `/author/${contact.authorProfile?.id}`
                    : undefined,
                  authorUrl: contact.authorProfile?.user
                    ? `/author/${contact.authorProfile?.id}`
                    : undefined,
                }))}
                size="sm"
                className="inline-flex items-center text-gray-600 font-medium"
                delimiterClassName="mx-2 text-gray-400"
                delimiter="•"
                showAbbreviatedInMobile={true}
                mobileExpandable={true}
              />
              {work.note.post.grant.organization && (
                <span className="text-gray-500 ml-1">@ {work.note.post.grant.organization}</span>
              )}
            </div>
          )
        ) : (
          <div className="min-w-0 truncate">
            <AuthorList
              authors={work.authors.map((authorship) => ({
                name: authorship.authorProfile.fullName,
                verified: authorship.authorProfile.user?.isVerified,
                profileUrl: `/author/${authorship.authorProfile.id}`,
                authorUrl: authorship.authorProfile.user
                  ? `/author/${authorship.authorProfile.id}`
                  : undefined,
              }))}
              size="sm"
              className="inline-flex items-center text-gray-600 font-medium"
              delimiterClassName="mx-2 text-gray-400"
              delimiter="•"
              showAbbreviatedInMobile={true}
              mobileExpandable={true}
            />
          </div>
        )}

        {work.publishedDate && (
          <div className="text-gray-500">
            {`Published ` +
              new Date(work.publishedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
          </div>
        )}
      </div>

      <WorkPrimaryActions
        work={work}
        showClaimButton={showClaimButton}
        insightsButton={insightsButton}
        metadata={metadata}
        onEditClick={onEditClick}
        className="mt-4"
      />
    </div>
  );
};
