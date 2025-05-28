'use client';

import { FC } from 'react';
import { GrantWithMetadata } from '@/store/grantStore';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useRouter } from 'next/navigation';
import { Users, Building, Calendar, MapPin } from 'lucide-react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { differenceInCalendarDays, format } from 'date-fns';

interface FeedItemGrantProps {
  grant: GrantWithMetadata;
  href?: string;
  className?: string;
}

export const FeedItemGrant: FC<FeedItemGrantProps> = ({ grant, href, className }) => {
  const router = useRouter();
  const { work, metadata } = grant;

  // Convert authors to the format expected by AuthorList
  const authors =
    work.authors?.map((author) => ({
      name: author.authorProfile.fullName,
      verified: author.authorProfile.user?.isVerified,
      profileUrl: author.authorProfile.profileUrl,
    })) || [];

  // Get funding organization from note
  const organization = work.note?.organization?.name;

  // Calculate days until deadline
  const deadline = metadata.fundraising?.endDate;
  const daysLeft = deadline ? differenceInCalendarDays(new Date(deadline), new Date()) : null;

  // Determine status
  const isOpen = metadata.fundraising?.status === 'OPEN';
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  // Use provided href or create default grant page URL
  const grantPageUrl = href || `/grant/${work.id}/${work.slug}`;

  // Handle click on the card
  const handleCardClick = () => {
    router.push(grantPageUrl);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Content Card */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer'
        )}
      >
        <div className="p-6">
          {/* Header with badges and status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <ContentTypeBadge type="grant" />
              {work.topics?.map((topic, index) => (
                <TopicAndJournalBadge
                  key={index}
                  type="topic"
                  name={topic.name}
                  slug={topic.slug || topic.name.toLowerCase().replace(/\s+/g, '-')}
                />
              ))}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {isOpen && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-emerald-700 font-medium">Open</span>
                </div>
              )}
              {!isOpen && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-500">Closed</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
            {work.title}
          </h2>

          {/* Short Description */}
          {(work as any).shortDescription && (
            <p className="text-gray-700 mb-4 leading-relaxed">{(work as any).shortDescription}</p>
          )}

          {/* Grant Details */}
          <div className="space-y-3">
            {/* Funding Amount */}
            {metadata.fundraising?.goalAmount && (
              <div className="flex items-center gap-3">
                <CurrencyBadge
                  amount={metadata.fundraising.goalAmount.usd}
                  currency="USD"
                  variant="text"
                  showText={true}
                  showIcon={true}
                  textColor="text-gray-900"
                  className="font-semibold text-2xl"
                  shorten={false}
                />
              </div>
            )}

            {/* Authors */}
            {authors.length > 0 && (
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <AuthorList
                  authors={authors}
                  size="sm"
                  className="text-gray-500 font-normal"
                  delimiter="•"
                  showAbbreviatedInMobile={true}
                />
              </div>
            )}

            {/* Organization */}
            {organization && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-500 font-normal">{organization}</span>
              </div>
            )}

            {/* Deadline */}
            {deadline && isOpen && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span
                  className={cn(
                    'text-sm font-normal',
                    isExpiringSoon ? 'text-amber-600' : 'text-gray-500'
                  )}
                >
                  {daysLeft !== null && daysLeft > 0 ? (
                    <>{daysLeft === 1 ? '1 day' : `${daysLeft} days`} left to apply</>
                  ) : (
                    `Deadline: ${format(new Date(deadline), 'MMM d, yyyy')}`
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
