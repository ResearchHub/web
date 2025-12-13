import { Scale, ExternalLink } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { Tooltip } from '@/components/ui/Tooltip';
import { parseLicense } from '../lib/creativeCommonsUtils';
import { useIsMobile } from '@/hooks/useIsMobile';

interface LicenseSectionProps {
  license?: string;
}

export const LicenseSection = ({ license }: LicenseSectionProps) => {
  const { type, icons, label, url, description } = parseLicense(license);
  const isMobile = useIsMobile();

  if (!license) {
    return null;
  }

  // Render CC licenses with icons
  if (type === 'cc-icons' && icons.length > 0 && url) {
    const tooltipContent =
      !isMobile && description ? (
        <div className="space-y-2.5 text-left">
          <div>
            <div className="font-semibold text-sm text-gray-900 leading-tight">
              {description.shortTitle}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description.title}</div>
          </div>
          {description.allows.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Allows:</div>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {description.allows.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-green-600 mr-1.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {description.disallows.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Disallows:</div>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {description.disallows.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-red-600 mr-1.5 flex-shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null;

    const badgeContent = (
      <div className="inline-flex items-center border border-gray-200 rounded overflow-hidden bg-white shadow-sm group cursor-default">
        <div className="flex items-center px-2.5 py-1.5 gap-1">
          {icons.map((icon, index) => (
            <FontAwesomeIcon
              key={icon.iconName}
              icon={icon}
              className={`${index === 0 ? 'text-xl' : 'text-lg'} text-gray-800`}
            />
          ))}
        </div>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 flex items-center gap-2 border-l border-gray-200 cursor-pointer hover:text-gray-600 transition-colors"
          aria-label={`View ${description?.title || 'Creative Commons license'} details`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-gray-800 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
            {label}
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
        </Link>
      </div>
    );

    const badgeWithTooltip = isMobile ? (
      badgeContent
    ) : (
      <Tooltip content={tooltipContent} position="top" width="w-72">
        {badgeContent}
      </Tooltip>
    );

    return (
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">License</h2>
        </div>
        <div className="flex items-center space-x-2">{badgeWithTooltip}</div>
      </section>
    );
  }

  // Render non-CC licenses with links (plain text style)
  if (type === 'text-with-link' && url && label) {
    return (
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">License</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{label}</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </section>
    );
  }

  // Render plain text only licenses (no links)
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Scale className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">License</h2>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{label || license}</span>
      </div>
    </section>
  );
};
