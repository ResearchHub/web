'use client';

import { History } from 'lucide-react';
import { DocumentVersion } from '@/types/work';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface VersionsSectionProps {
  versions: DocumentVersion[];
  currentPaperId: number;
}

export const VersionsSection = ({ versions, currentPaperId }: VersionsSectionProps) => {
  // If there are no versions or only one version, don't show the section
  if (!versions || versions.length <= 1) {
    return null;
  }

  // Sort versions with newer versions first
  // First try to sort by version number (assuming higher version = newer)
  // If that fails, fall back to publishedDate
  const sortedVersions = [...versions].sort((a, b) => {
    // First try to parse as numbers for more reliable sorting
    const versionA = parseFloat(a.version);
    const versionB = parseFloat(b.version);

    if (!isNaN(versionA) && !isNaN(versionB)) {
      return versionB - versionA; // Higher version numbers first
    }

    // Fallback to date-based sorting
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  });

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <History className="h-5 w-5 text-gray-500" />
        <h3 className="text-base font-medium">Versions</h3>
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
                <Badge variant="default" className="text-xs mr-2">
                  Preprint
                </Badge>

                {/* Spacer to push date and view link to the right */}
                <div className="flex-grow" />

                <span className="text-xs text-gray-500 ml-auto">{formattedDate}</span>
              </div>

              {version.description && (
                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{version.description}</p>
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
