'use client';

import { History } from 'lucide-react';
import { DocumentVersion } from '@/types/work';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { VersionOfRecordBadge } from '@/components/ui/VersionOfRecordBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { buildWorkUrl } from '@/utils/url';

interface VersionsSectionProps {
  versions: DocumentVersion[];
  currentPaperId: number;
  slug?: string;
}

export const VersionsSection = ({ versions, currentPaperId, slug }: VersionsSectionProps) => {
  // If there are no versions or only one version, don't show the section
  if (!versions || versions.length < 1) {
    return null;
  }

  // Sort versions with newer versions first by version number
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  // Limit to displaying only 2 versions
  const displayVersions = sortedVersions.slice(0, 3);
  const hasMoreVersions = sortedVersions.length > 3;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <History className="h-5 w-5 text-gray-500" />
        <h3 className="text-base font-medium">Available Versions</h3>
      </div>

      <div className="space-y-2">
        {displayVersions.map((version) => {
          const isCurrentVersion = version.paperId === currentPaperId;
          const formattedDate = new Date(version.publishedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          const VersionContent = () => (
            <>
              <div className="flex items-center">
                <div className="w-5 mr-2">
                  <span
                    className={`${isCurrentVersion ? 'font-medium text-blue-700' : 'text-gray-700'}`}
                  >
                    v{version.version}
                  </span>
                </div>
                {/* Publication type badge: show preprint only; if published, show VersionOfRecord badge */}
                {version.isVersionOfRecord ? (
                  <VersionOfRecordBadge size="sm" className="mr-2 h-[22px]" />
                ) : (
                  <ContentTypeBadge
                    type="preprint"
                    size="sm"
                    showTooltip={true}
                    className="!py-0 !px-2"
                  />
                )}

                {/* Spacer to push date and view link to the right */}
                <div className="flex-grow" />

                <span className="text-xs text-gray-500 ml-auto">{formattedDate}</span>
              </div>
            </>
          );

          const contentNode = <VersionContent />;

          const wrappedContent = contentNode;

          return isCurrentVersion ? (
            <div
              key={version.paperId}
              className="p-2 text-sm rounded-md bg-blue-50 border border-blue-100"
            >
              {wrappedContent}
            </div>
          ) : (
            <Link
              key={version.paperId}
              href={buildWorkUrl({
                id: version.paperId,
                contentType: 'paper',
                slug: slug,
              })}
              className="block p-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {wrappedContent}
            </Link>
          );
        })}

        {hasMoreVersions && (
          <div className="mt-3 text-center">
            <Link
              href={buildWorkUrl({
                id: currentPaperId,
                contentType: 'paper',
                slug: slug,
                tab: 'history' as any,
              })}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View all versions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
