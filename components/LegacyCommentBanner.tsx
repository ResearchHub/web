import { AlertTriangle, ExternalLink } from 'lucide-react';
import { isProduction } from '@/utils/featureFlags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'next/navigation';
import { ContentType } from '@/types/work';

interface LegacyCommentBannerProps {
  contentType?: ContentType;
  onClose?: () => void;
}

/**
 * Banner component that displays a warning for legacy comments
 * and provides a link to view or edit them in the original comment system.
 */
export const LegacyCommentBanner = ({ contentType, onClose }: LegacyCommentBannerProps) => {
  // Determine the correct URL based on environment
  const baseUrl = isProduction() ? 'https://researchhub.com' : 'https://staging.researchhub.com';

  const { slug, id } = useParams();

  const workUrl = contentType === 'paper' ? `/paper/${id}/${slug}` : `/post/${id}/${slug}`;

  const legacyCommentUrl = `${baseUrl}${workUrl}/conversation`;

  return (
    <div className="relative bg-amber-50 border-l-4 border-amber-400 p-4 pr-6 mb-4">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-amber-400 hover:text-amber-600"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <span>
              This comment was added using the old version of ResearchHub. To make changes, you'll
              need to use the old site's editor.
            </span>
            <a
              href={legacyCommentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center underline mt-1"
            >
              <span>Open in old ResearchHub</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
