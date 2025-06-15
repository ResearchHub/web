import { AlertTriangle, ExternalLink } from 'lucide-react';
import { isProduction } from '@/utils/featureFlags';

interface LegacyNoteBannerProps {
  orgSlug: string;
  noteId: string;
}

/**
 * Banner component that displays a warning for legacy notes
 * and provides a link to view/edit them in the original notebook system
 */
export const LegacyNoteBanner = ({ orgSlug, noteId }: LegacyNoteBannerProps) => {
  // Determine the correct URL based on environment
  const baseUrl = isProduction()
    ? 'https://old.researchhub.com'
    : 'https://old.staging.researchhub.com';

  const legacyNoteUrl = `${baseUrl}/${orgSlug}/notebook/${noteId}`;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <span>
              This note was created in our previous notebook system and needs to be edited there.
            </span>
            <a
              href={legacyNoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center underline"
            >
              <span>View and edit in original notebook</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
