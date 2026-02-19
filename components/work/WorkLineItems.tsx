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
      <WorkPrimaryActions
        work={work}
        showClaimButton={showClaimButton}
        insightsButton={insightsButton}
        metadata={metadata}
        onEditClick={onEditClick}
      />

      {/* Authors/Contacts */}
      <div className="mt-6 space-y-2 text-sm text-gray-600">
        <div>
          {work.contentType === 'funding_request' ? (
            work.note?.post?.grant?.contacts && work.note.post.grant.contacts.length > 0 ? (
              <div className="flex items-start gap-4 min-w-0">
                <span className="font-medium text-gray-900 flex-shrink-0 w-16 tablet:w-28">
                  Funder{work.note.post.grant.contacts.length > 1 ? '(s)' : ''}
                </span>
                <div className="flex-1 min-w-0 truncate">
                  <span className="inline-flex items-center">
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
                      <span className="text-gray-500 ml-1">
                        @ {work.note.post.grant.organization}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ) : null
          ) : (
            <div className="flex items-start gap-4 min-w-0">
              <span className="font-medium text-gray-900 flex-shrink-0 w-16 tablet:w-28">
                Authors
              </span>
              <div className="flex-1 min-w-0 truncate">
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
            </div>
          )}
        </div>

        {/* Published Date */}
        {work.publishedDate && (
          <div className="flex items-start gap-4 min-w-0">
            <span className="font-medium text-gray-900 flex-shrink-0 w-16 tablet:w-28">
              Published
            </span>
            <div className="flex-1 min-w-0">
              <span>
                {new Date(work.publishedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
