import Link from 'next/link';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { DocumentVersion } from '@/types/work';
import { VersionOfRecordBadge } from '@/components/ui/VersionOfRecordBadge';

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
      <div className="space-y-4">
        {sortedVersions.map((version) => {
          const isViewingThisCard = version.paperId === currentPaperId;
          const isLatest = version.isLatest;
          const publishedDate = new Date(version.publishedDate);

          // Generate the URL for this version
          const versionUrl = `/paper/${version.paperId}/${slug}`;

          return (
            <div key={version.version}>
              <Link
                href={versionUrl}
                className={cn(
                  'block no-underline text-inherit',
                  isViewingThisCard ? 'pointer-events-none' : ''
                )}
              >
                <div
                  className={cn(
                    'border rounded-lg overflow-hidden',
                    'transition-all duration-200',
                    isViewingThisCard
                      ? 'bg-blue-50 border-blue-100 shadow-sm'
                      : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-primary-100',
                    'cursor-pointer'
                  )}
                >
                  <div className="p-6 flex items-center justify-between">
                    {/* Left */}
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3
                          className={cn(
                            'text-base font-medium',
                            isViewingThisCard ? 'text-blue-700' : 'text-gray-800',
                            !isViewingThisCard && 'group-hover/card:text-primary-600'
                          )}
                        >
                          Version {version.version}
                        </h3>
                        {version.isVersionOfRecord && <VersionOfRecordBadge />}
                        {version.publicationStatus !== 'PUBLISHED' && (
                          <ContentTypeBadge
                            type="preprint"
                            size="sm"
                            showTooltip={false}
                            className="!py-0.5 !px-2"
                          />
                        )}
                      </div>
                      {version.message && (
                        <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                          {version.message}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        <span>
                          Published{' '}
                          {publishedDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
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
