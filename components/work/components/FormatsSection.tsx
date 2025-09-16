import { Download, File } from 'lucide-react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/pro-light-svg-icons';
import { handleDownload } from '@/utils/download';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { ContentType } from '@/types/work';
import { WorkInteractionEvent } from '@/types/analytics';

interface Format {
  type: string;
  url: string;
}

interface FormatsSectionProps {
  formats: Format[];
  workId: string;
  contentType: ContentType;
}

export const FormatsSection = ({ formats, workId, contentType }: FormatsSectionProps) => {
  const { user } = useUser();

  if (!formats || formats.length === 0) return null;

  const trackFileDownload = (format: Format) => {
    const payload: WorkInteractionEvent = {
      interaction_type: 'pdf_downloaded',
      work_id: workId,
      content_type: contentType,
      link_url: format.url,
    };
    // Track the work interaction event
    AnalyticsService.logEventWithUserProperties(LogEvent.WORK_INTERACTION, payload, user);

    // Execute the download
    handleDownload(format.url, `document.${format.type.toLowerCase()}`);
  };

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <h2 className="text-base font-semibold text-gray-900">Other Formats</h2>
      </div>
      <div className="space-y-2">
        {formats.map((format, index) => (
          <div key={index} className="flex items-center justify-between">
            <Link
              href={format.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
              onClick={() => trackFileDownload(format)}
            >
              {format.type === 'PDF' ? (
                <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4 text-gray-500" />
              ) : (
                <File className="h-4 w-4" />
              )}
              <span>{format.type}</span>
            </Link>
            <button
              onClick={() => {
                trackFileDownload(format);
                handleDownload(format.url, `document.${format.type.toLowerCase()}`);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
