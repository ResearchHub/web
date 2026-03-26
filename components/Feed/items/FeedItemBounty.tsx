'use client';

import { FC, useMemo, useState } from 'react';
import { FeedEntry, FeedBountyContent, FeedPaperContent, FeedPostContent } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  MetadataSection,
  PrimaryActionSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemTopicBadges } from '@/components/Feed/FeedItemTopicBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Button } from '@/components/ui/Button';
import { Bounty } from '@/types/bounty';
import { BountyDetailsModal } from '@/components/Bounty/BountyInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/pro-solid-svg-icons';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { getBountyDisplayAmount, isExpiringSoon } from '@/components/Bounty/lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDeadline, isDeadlineInFuture } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
import { mapApiDocumentTypeToClientType, ApiDocumentType } from '@/utils/contentTypeMapping';
import { ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentFormat } from '@/types/comment';

interface FeedItemBountyProps {
  entry: FeedEntry;
  href?: string;
  showActions?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
}

/**
 * Extracts the bounty, title, authors, topics, and other data from the entry
 * regardless of whether it's a true BOUNTY contentType or a PAPER/POST entry
 * with bounties attached (as created by BountyService).
 */
function extractBountyData(entry: FeedEntry) {
  const isBountyContentType = entry.contentType === 'BOUNTY';

  if (isBountyContentType) {
    const bountyContent = entry.content as FeedBountyContent;
    const bounty = bountyContent.bounty;
    const relatedWork = entry.relatedWork;

    return {
      bounty,
      title: relatedWork?.title ?? 'Bounty',
      authors:
        relatedWork?.authors?.map((a) => ({
          name: a.authorProfile?.fullName ?? '',
          verified: a.authorProfile?.user?.isVerified,
          authorUrl: a.authorProfile?.profileUrl,
        })) ?? [],
      topics: relatedWork?.topics ?? [],
      category: relatedWork?.category,
      subcategory: relatedWork?.subcategory,
      postType: relatedWork?.postType,
      commentContent: bountyContent.comment?.content,
      commentFormat: bountyContent.comment?.contentFormat,
      workId: relatedWork?.id,
      workSlug: relatedWork?.slug,
      workContentType: relatedWork?.contentType,
    };
  }

  // PAPER or POST entry with bounties[] attached
  const content = entry.content as FeedPaperContent | FeedPostContent;
  const openBounties = content.bounties?.filter((b) => b.status === 'OPEN') ?? [];
  const bounty: Bounty = openBounties[0] ?? content.bounties?.[0];

  const isPaper = content.contentType === 'PAPER';
  const paperContent = isPaper ? (content as FeedPaperContent) : undefined;
  const postContent = !isPaper ? (content as FeedPostContent) : undefined;

  return {
    bounty,
    title: isPaper ? paperContent!.title : postContent!.title,
    authors: content.createdBy
      ? 'authors' in content && Array.isArray(content.authors)
        ? content.authors.map((a) => ({
            name: a.fullName ?? '',
            verified: a.user?.isVerified,
            authorUrl: a.profileUrl,
          }))
        : [
            {
              name: content.createdBy.fullName ?? '',
              verified: content.createdBy.user?.isVerified,
              authorUrl: content.createdBy.profileUrl,
            },
          ]
      : [],
    topics: 'topics' in content ? (content.topics ?? []) : [],
    category: 'category' in content ? content.category : undefined,
    subcategory: 'subcategory' in content ? content.subcategory : undefined,
    postType: 'postType' in content ? content.postType : undefined,
    commentContent: bounty?.comment?.content,
    commentFormat: bounty?.comment?.contentFormat as ContentFormat | undefined,
    workId: content.id,
    workSlug: 'slug' in content ? content.slug : undefined,
    workContentType:
      mapApiDocumentTypeToClientType(content.contentType as ApiDocumentType) ?? 'post',
  };
}

export const FeedItemBounty: FC<FeedItemBountyProps> = ({
  entry,
  href,
  showActions = true,
  maxLength,
  onFeedItemClick,
}) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const {
    bounty,
    title,
    authors,
    topics,
    category,
    subcategory,
    postType,
    commentContent,
    commentFormat,
    workId,
    workSlug,
    workContentType,
  } = extractBountyData(entry);

  if (!bounty) return null;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const creatorProfile = bounty.createdBy?.authorProfile;
  const bountyCreator = creatorProfile
    ? {
        id: creatorProfile.id,
        fullName: creatorProfile.fullName,
        profileImage: creatorProfile.profileImage,
        profileUrl: creatorProfile.profileUrl,
      }
    : bounty.createdBy?.id
      ? {
          id: bounty.createdBy.id,
          fullName: bounty.createdBy.fullName,
          profileImage: '',
          profileUrl: '#',
        }
      : undefined;

  const isActive = useMemo(() => {
    if (bounty.status === 'OPEN') {
      return bounty.expirationDate ? isDeadlineInFuture(bounty.expirationDate) : true;
    }
    return bounty.status === 'ASSESSMENT';
  }, [bounty.status, bounty.expirationDate]);

  const deadlineLabel = useMemo(() => {
    if (bounty.status === 'ASSESSMENT') return 'Assessment Period';
    if (!bounty.expirationDate) return undefined;
    if (isExpiringSoon(bounty.expirationDate, 1)) {
      return formatDeadline(bounty.expirationDate);
    }
    return `Ends ${formatDate(bounty.expirationDate)}`;
  }, [bounty.status, bounty.expirationDate]);

  const { amount: displayAmount } = useMemo(
    () => getBountyDisplayAmount(bounty, exchangeRate, showUSD),
    [bounty, exchangeRate, showUSD]
  );

  const bountyLabel = bounty.bountyType === 'REVIEW' ? 'Peer Review' : 'Bounty';

  const getAddButtonText = () => {
    if (postType === 'QUESTION') return 'Answer';
    if (bounty.bountyType === 'REVIEW') return 'Add Review';
    return 'Solve';
  };

  const workUrl = useMemo(() => {
    if (href) return href;
    if (!workId || !workContentType) return undefined;

    let ct = workContentType;
    if (postType === 'QUESTION' && ct === 'post') {
      ct = 'question';
    }

    return buildWorkUrl({
      id: workId,
      slug: workSlug,
      contentType: ct,
      tab: 'bounties',
    });
  }, [href, workId, workSlug, workContentType, postType]);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailsModalOpen(true);
  };

  const handleAddSolutionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!workId || !workContentType) return;

    if (onFeedItemClick) onFeedItemClick();

    let ct = workContentType;
    if (postType === 'QUESTION') ct = 'question';
    const targetTab = postType === 'QUESTION' ? 'conversation' : 'reviews';

    const url = buildWorkUrl({
      id: workId,
      slug: workSlug,
      contentType: ct,
      tab: targetTab,
    });
    router.push(`${url}?focus=true`);
  };

  return (
    <>
      <BaseFeedItem
        entry={entry}
        href={workUrl}
        showActions={showActions}
        showHeader={false}
        showBountyInfo={false}
        hideBountyActions={true}
        onFeedItemClick={onFeedItemClick}
        hideReportButton={false}
        badges={
          <FeedItemTopicBadges topics={topics} category={category} subcategory={subcategory} />
        }
      >
        <TitleSection
          title={title}
          href={workUrl}
          onClick={onFeedItemClick}
          className="text-md md:!text-md"
        />

        {authors.length > 0 && (
          <MetadataSection className="mb-0">
            <AuthorList
              authors={authors}
              size="sm"
              className="text-gray-500 font-normal text-sm"
              delimiter=","
              delimiterClassName="ml-0"
              showAbbreviatedInMobile={true}
              hideExpandButton={true}
            />
          </MetadataSection>
        )}

        {bountyCreator && (
          <MetadataSection className="mb-0 py-4">
            <div className="flex items-center gap-2.5">
              <AuthorTooltip authorId={bountyCreator.id !== 0 ? bountyCreator.id : undefined}>
                <Avatar
                  src={bountyCreator.profileImage || undefined}
                  alt={bountyCreator.fullName}
                  size="sm"
                  disableTooltip
                />
              </AuthorTooltip>
              <div className="flex flex-col min-w-0">
                <Link
                  href={bountyCreator.profileUrl || '#'}
                  className="text-sm font-medium text-gray-900 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {bountyCreator.fullName}
                </Link>
                <span className="text-xs text-gray-500">Offering bounty</span>
              </div>
            </div>
          </MetadataSection>
        )}

        <PrimaryActionSection>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-6 min-w-0">
              <div className="flex flex-col leading-tight whitespace-nowrap">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{bountyLabel}</span>
                <span className="font-mono font-semibold text-primary-600 text-xl">
                  {formatCurrency({
                    amount: Math.round(displayAmount),
                    showUSD,
                    exchangeRate,
                    skipConversion: showUSD,
                    shorten: true,
                  })}
                </span>
              </div>

              {deadlineLabel && (
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Deadline
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {deadlineLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outlined"
                size="sm"
                className="flex-shrink-0 rounded-lg text-[13px] gap-1.5 text-gray-600 hover:text-gray-800"
                onClick={handleDetailsClick}
              >
                <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5" />
                Details
              </Button>
              {isActive ? (
                <Button
                  variant="dark"
                  size="sm"
                  className="flex-shrink-0 gap-1"
                  onClick={handleAddSolutionClick}
                >
                  {getAddButtonText()}
                  <ArrowRight size={14} />
                </Button>
              ) : (
                <span className="flex-shrink-0 text-sm text-gray-400">Ended</span>
              )}
            </div>
          </div>
        </PrimaryActionSection>
      </BaseFeedItem>

      <BountyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={title}
        content={commentContent}
        contentFormat={commentFormat}
        bountyType={bounty.bountyType}
        displayAmount={displayAmount}
        showUSD={showUSD}
        deadlineLabel={deadlineLabel}
        onAddSolutionClick={handleAddSolutionClick}
        buttonText={getAddButtonText()}
        isActive={isActive}
      />
    </>
  );
};
