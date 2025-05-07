'use client';

import { FC } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { formatRSC } from '@/utils/number';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';
import { AuthorList } from '@/components/ui/AuthorList';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { DeadlineDisplay } from '@/components/ui/DeadlineDisplay';
import { formatDistanceStrict } from 'date-fns';

interface BountyCarouselItemProps {
  entry: FeedEntry;
}

export const BountyCarouselItem: FC<BountyCarouselItemProps> = ({ entry }) => {
  const router = useRouter();
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;
  const relatedWork = entry.relatedWork;

  // Generate href for the paper/post
  const href =
    relatedWork?.contentType === 'paper'
      ? `/paper/${relatedWork.id}/${relatedWork.slug}/bounties`
      : `/post/${relatedWork?.id}/${relatedWork?.slug}/bounties`;

  // Format RSC amount for display
  const formattedAmount = formatRSC({ amount: parseFloat(bounty.totalAmount) });

  // Determine if this is a peer review bounty
  const isPeerReviewBounty = bounty.bountyType === 'REVIEW';

  const handleCardClick = () => {
    router.push(href);
  };

  // Get topic from topics if available
  const topic =
    relatedWork?.topics && relatedWork.topics.length > 0
      ? {
          name: relatedWork.topics[0].name,
          slug: relatedWork.topics[0].slug,
        }
      : null;

  // Convert the authors to the format expected by AuthorList
  const authors =
    relatedWork?.authors?.map((authorship) => ({
      name: authorship.authorProfile.fullName,
      verified: authorship.authorProfile.user?.isVerified,
      profileUrl: authorship.authorProfile.profileUrl,
    })) || [];

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden w-[250px] cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col"
      onClick={handleCardClick}
    >
      {/* Paper info section */}
      <div className="p-3 pb-2 flex-grow">
        {/* Topic badge */}
        <div className="mb-2 inline-flex">
          {topic && (
            <TopicAndJournalBadge
              type="topic"
              name={topic.name}
              slug={topic.slug}
              disableLink={true}
              size="sm"
            />
          )}
        </div>

        {/* Paper Title */}
        <div className="font-medium text-gray-900 mb-1 text-sm">
          <div className="line-clamp-3">
            {isPeerReviewBounty && '[Peer Review Needed] '}
            {relatedWork?.title}
          </div>
        </div>

        {/* Authors - using AuthorList */}
        <div className="text-gray-600 line-clamp-1">
          {authors.length > 0 && (
            <AuthorList
              authors={authors}
              className="font-normal text-gray-600"
              size="xs"
              delimiter="•"
              maxLength={1}
            />
          )}
        </div>
      </div>

      {/* Bounty section - simplified yellow background */}
      <div className="p-2">
        <div className="bg-amber-100 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-amber-700 flex items-center">
                <CurrencyBadge
                  amount={parseFloat(bounty.totalAmount)}
                  size="xs"
                  variant="inline"
                  className="font-semibold"
                  label="Bounty"
                  textColor="text-amber-700"
                  currencyLabelColor="text-amber-700"
                />
                <div className="text-amber-600 text-xs">
                  {isPeerReviewBounty ? 'to peer review' : 'to answer'}
                </div>
              </div>
            </div>

            {/* Avatars of the bounty creator/contributors */}
            <div className="mt-1">
              <AvatarStack
                items={[
                  {
                    src: bounty.createdBy?.authorProfile?.profileImage || '',
                    alt: bounty.createdBy?.fullName || 'Creator',
                    tooltip: `Created by ${bounty.createdBy?.fullName || 'Creator'}`,
                    authorId: bounty.createdBy?.id,
                  },
                  ...bounty.contributions
                    .map((contribution) => ({
                      src: contribution.createdBy?.authorProfile?.profileImage || '',
                      alt: contribution.createdBy?.fullName || 'Contributor',
                      tooltip: `Contributed by ${contribution.createdBy?.fullName || 'Contributor'}`,
                      authorId: contribution.createdBy?.id,
                    }))
                    .slice(0, 2),
                ]}
                size="xs"
                maxItems={3}
                spacing={-6}
                showExtraCount={bounty.contributions.length > 2}
                totalItemsCount={bounty.contributions.length + 1} // +1 for the creator
                extraCountLabel="Contributors"
                ringColorClass="ring-amber-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
