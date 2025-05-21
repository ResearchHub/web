'use client';

import { History } from 'lucide-react';
import { DocumentVersion } from '@/types/work';
import { Badge } from '@/components/ui/Badge';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import Link from 'next/link';
import { cn } from '@/utils/styles';

interface VersionsSectionProps {
  versions: DocumentVersion[];
  currentPaperId: number;
}

export const VersionsSection = ({ versions, currentPaperId }: VersionsSectionProps) => {
  // If there are no versions or only one version, don't show the section
  if (!versions || versions.length < 1) {
    return null;
  }

  // Sort versions with newer versions first by version number
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <History className="h-5 w-5 text-gray-500" />
        <h3 className="text-base font-medium">Available Versions</h3>
      </div>

      <div className="space-y-2">
        {sortedVersions.map((version) => {
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
                <ContentTypeBadge
                  type={version.publicationStatus === 'PUBLISHED' ? 'published' : 'preprint'}
                  size="xs"
                  showTooltip={false}
                  className="mr-2 !py-0.5 !px-2"
                />

                {version.isVersionOfRecord && (
                  <Badge
                    variant="default"
                    className="text-xs mr-2 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Version of Record
                  </Badge>
                )}

                {/* Spacer to push date and view link to the right */}
                <div className="flex-grow" />

                <span className="text-xs text-gray-500 ml-auto">{formattedDate}</span>
              </div>

              {version.message && (
                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{version.message}</p>
              )}
            </>
          );

          return isCurrentVersion ? (
            <div
              key={version.paperId}
              className="p-2 text-sm rounded-md bg-blue-50 border border-blue-100"
            >
              <VersionContent />
            </div>
          ) : (
            <Link
              key={version.paperId}
              href={`/paper/${version.paperId}`}
              className="block p-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <VersionContent />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
