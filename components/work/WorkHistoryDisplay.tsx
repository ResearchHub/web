import { Work, DocumentVersion } from '@/types/work';
import { ChevronsLeftRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Badge } from '@/components/ui/Badge';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface WorkHistoryDisplayProps {
  versions: DocumentVersion[];
  currentPaperId: number; // ID of the work currently being viewed
  slug: string; // Slug for navigation
}

export const WorkHistoryDisplay = ({ versions, currentPaperId, slug }: WorkHistoryDisplayProps) => {
  if (!versions || versions.length === 0) {
    return <p className="mt-6 text-gray-500">No version history available for this document.</p>;
  }

  // Sort versions descending by published date, then by version number if equal
  const sortedVersions = [...versions].sort((a, b) => {
    const dateDiff = new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    // Compare version numbers
    return b.version - a.version;
  });

  return (
    <div className="mt-8">
      <div className="space-y-8">
        {sortedVersions.map((version) => {
          const isViewingThisCard = version.paperId === currentPaperId;
          const isLatest = version.isLatest;
          const publishedDate = new Date(version.publishedDate);

          // Generate the URL for this version
          const versionUrl = `/paper/${version.paperId}/${slug}`;

          return (
            <div key={version.version} className="group/card">
              <Link
                href={versionUrl}
                className={cn(
                  'block no-underline text-inherit',
                  isViewingThisCard ? 'pointer-events-none' : ''
                )}
              >
                <div
                  className={cn(
                    'border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden',
                    'transition-all duration-200',
                    !isViewingThisCard && 'hover:shadow-md hover:border-indigo-100',
                    'cursor-pointer'
                  )}
                >
                  <div className="p-6 flex items-center justify-between">
                    {/* Left */}
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3
                          className={cn(
                            'text-base font-medium text-gray-800',
                            !isViewingThisCard && 'group-hover/card:text-indigo-600'
                          )}
                        >
                          {version.message || `Version ${version.version}`}
                        </h3>
                        {version.isLatest && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs">
                            Latest
                          </span>
                        )}
                        {version.isVersionOfRecord && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs">
                            Version of Record
                          </span>
                        )}
                        {isViewingThisCard && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs">
                            Currently Viewing
                          </span>
                        )}
                        {version.publicationStatus && (
                          <ContentTypeBadge
                            type={
                              version.publicationStatus === 'PUBLISHED' ? 'published' : 'preprint'
                            }
                            size="sm"
                            showTooltip={false}
                            className="!py-0.5 !px-2"
                          />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span>
                          Published:{' '}
                          {publishedDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          ,{' '}
                          {publishedDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
