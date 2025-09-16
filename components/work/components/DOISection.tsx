import { Link2 } from 'lucide-react';
import Link from 'next/link';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { WorkInteractionEvent } from '@/types/analytics';
import { ContentType } from '@/types/work';

interface DOISectionProps {
  doi: string;
  workId: string;
  contentType: ContentType;
}

export const DOISection = ({ doi, workId, contentType }: DOISectionProps) => {
  const { user } = useUser();

  if (!doi) return null;

  const doiUrl = `https://doi.org/${doi}`;

  const handleDOIClick = () => {
    const payload: WorkInteractionEvent = {
      interaction_type: 'doi_clicked',
      work_id: workId,
      content_type: contentType,
      link_url: doiUrl,
    };

    AnalyticsService.logEventWithUserProperties(LogEvent.WORK_INTERACTION, payload, user);
  };

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Link2 className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">DOI</h2>
      </div>
      <Link
        href={doiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
        onClick={handleDOIClick}
      >
        <span>{doi}</span>
      </Link>
    </section>
  );
};
