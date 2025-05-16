import { Work, DocumentVersion } from '@/types/work';
import { ChevronsLeftRight } from 'lucide-react';
import Link from 'next/link';

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
    const numA = parseFloat(a.version);
    const numB = parseFloat(b.version);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA; // newest version number first
    }
    // Fallback to lexicographical
    return b.version.localeCompare(a.version);
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
            <Link
              key={version.version}
              href={versionUrl}
              className={
                isViewingThisCard ? 'cursor-default pointer-events-none' : 'cursor-pointer'
              }
            >
              <div className="flex">
                {/* Card */}
                <div className="flex-1">
                  <div className="group border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow transition-shadow p-6 flex items-center justify-between">
                    {/* Left */}
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="text-base font-medium group-hover:underline text-gray-800">
                          {version.description || `Version ${version.version}`}
                        </h3>
                        {version.isLatest && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs">
                            Latest
                          </span>
                        )}
                        {isViewingThisCard && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs">
                            Currently Viewing
                          </span>
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

                    {/* CTA icon */}
                    {!isViewingThisCard && (
                      <div className="rounded-md p-2 text-gray-500 group-hover:text-indigo-600">
                        <ChevronsLeftRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
