'use client';

import Link from 'next/link';
import { TransformedEditorData } from '@/types/editor';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/styles';

interface EditorDashboardCardProps {
  editor: TransformedEditorData;
  index: number;
}

export function EditorDashboardCard({ editor, index }: EditorDashboardCardProps) {
  const {
    id,
    authorProfile,
    commentCount,
    submissionCount,
    supportCount,
    latestCommentDate,
    latestSubmissionDate,
    editorAddedDate,
    activeHubContributorCount,
    previousActiveHubContributorCount,
  } = editor;

  const calculatePercentDiff = (current: number, previous: number): number => {
    if (current === 0) {
      if (previous > 0) return -100;
      if (previous === 0) return 0;
    }
    const val = (current - previous) / Math.max(current, previous);
    return parseFloat((val * 100).toFixed(1));
  };

  const renderContributorChange = () => {
    if (
      activeHubContributorCount === undefined ||
      previousActiveHubContributorCount === undefined
    ) {
      return null;
    }

    const percentDiff = calculatePercentDiff(
      activeHubContributorCount,
      previousActiveHubContributorCount
    );

    let icon = <Minus className="h-3 w-3" />;
    let colorClass = 'text-gray-500';

    if (percentDiff > 0) {
      icon = <TrendingUp className="h-3 w-3" />;
      colorClass = 'text-green-600';
    } else if (percentDiff < 0) {
      icon = <TrendingDown className="h-3 w-3" />;
      colorClass = 'text-red-600';
    }

    return (
      <div className={cn('flex items-center space-x-1 text-sm', colorClass)}>
        {icon}
        <span>{Math.abs(percentDiff)}%</span>
      </div>
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'never';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const hubTags = authorProfile.editorOfHubs?.map((hub, hubIndex) => (
    <Badge key={`${hub.id}-${hubIndex}`} variant="default" className="text-xs">
      {hub.name}
    </Badge>
  ));

  return (
    <Link
      href={`/author/${id}`}
      className={cn(
        'block border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors',
        index === 0 && 'border-t-0'
      )}
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0">
          {/* User Info Section */}
          <div className="flex-1 flex items-start space-x-4">
            <Avatar
              src={authorProfile.profileImage}
              alt={`${authorProfile.firstName} ${authorProfile.lastName}`}
              size={40}
              authorId={id}
              disableTooltip={true}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {`${authorProfile.firstName} ${authorProfile.lastName}`}
                </h3>
              </div>

              {editorAddedDate && (
                <p className="text-sm text-gray-500 mb-1">added {formatDate(editorAddedDate)}</p>
              )}

              {activeHubContributorCount !== null && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">
                    active hub contributors: {activeHubContributorCount}
                  </span>
                  {renderContributorChange()}
                </div>
              )}

              <div className="hidden lg:flex flex-wrap gap-2">{hubTags}</div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-8">
            {/* Mobile: Active Contributors */}
            {activeHubContributorCount !== null && (
              <div className="lg:hidden flex items-center justify-between">
                <span className="text-sm text-gray-500">Hub Active Contributors</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{activeHubContributorCount}</span>
                  {renderContributorChange()}
                </div>
              </div>
            )}

            {/* Last Submission */}
            <div className="flex items-center justify-between lg:justify-start lg:w-24">
              <span className="text-sm text-gray-500 lg:hidden">Last Submission</span>
              <span className="text-sm font-medium">{formatDate(latestSubmissionDate)}</span>
            </div>

            {/* Last Comment */}
            <div className="flex items-center justify-between lg:justify-start lg:w-24">
              <span className="text-sm text-gray-500 lg:hidden">Last Comment</span>
              <span className="text-sm font-medium">{formatDate(latestCommentDate)}</span>
            </div>

            {/* Submissions */}
            <div className="flex items-center justify-between lg:justify-start lg:w-20">
              <span className="text-sm text-gray-500 lg:hidden">Submissions</span>
              <span className="text-sm font-medium">{submissionCount}</span>
            </div>

            {/* Supports */}
            <div className="flex items-center justify-between lg:justify-start lg:w-16">
              <span className="text-sm text-gray-500 lg:hidden">Supports</span>
              <span className="text-sm font-medium">{supportCount}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center justify-between lg:justify-start lg:w-20">
              <span className="text-sm text-gray-500 lg:hidden">Comments</span>
              <span className="text-sm font-medium">{commentCount}</span>
            </div>
          </div>
        </div>

        {/* Mobile: Hub Tags */}
        <div className="lg:hidden flex flex-wrap gap-2 mt-3">{hubTags}</div>
      </div>
    </Link>
  );
}
