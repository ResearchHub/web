import Link from 'next/link';
import type { PageInfo } from './pageRoutes';

interface TopBarBreadcrumbProps {
  pageInfo: PageInfo;
  breadcrumbChild: string | null;
  breadcrumbParentTitle: string | null;
  breadcrumbParentHref: string | null;
  variant: 'mobile' | 'desktop';
}

const TRUNCATE_LENGTH = 50;

const truncateText = (text: string) =>
  text.length > TRUNCATE_LENGTH ? `${text.slice(0, TRUNCATE_LENGTH)}…` : text;

const ParentLabel = ({
  href,
  title,
  className,
  style,
}: {
  href: string | null;
  title: string | null;
  className: string;
  style?: React.CSSProperties;
}) => {
  if (!title) return null;

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} hover:text-gray-600 transition-colors`}
        style={style}
      >
        {title}
      </Link>
    );
  }

  return (
    <h1 className={className} style={style}>
      {title}
    </h1>
  );
};

export const TopBarBreadcrumb = ({
  pageInfo,
  breadcrumbChild,
  breadcrumbParentTitle,
  breadcrumbParentHref,
  variant,
}: TopBarBreadcrumbProps) => {
  const isMobile = variant === 'mobile';

  const containerClass = isMobile
    ? 'flex tablet:!hidden items-center min-w-0'
    : 'hidden tablet:!flex items-center min-w-0';

  const parentClass = isMobile
    ? 'leading-tight flex-shrink-0 text-gray-400 font-medium text-base'
    : 'leading-tight flex-shrink-0 text-gray-400 font-medium';

  const parentStyle = isMobile ? undefined : { fontSize: '20px', letterSpacing: '-0.5px' };

  const titleClass = isMobile
    ? 'leading-tight flex-shrink-0 font-semibold text-gray-900 text-lg'
    : 'leading-tight flex-shrink-0 font-semibold text-gray-900';

  const titleStyle = isMobile ? undefined : { fontSize: '24px', letterSpacing: '-0.5px' };

  const separatorClass = isMobile
    ? 'text-gray-300 flex-shrink-0 text-sm'
    : 'text-gray-300 flex-shrink-0';

  const separatorStyle = isMobile ? undefined : { fontSize: '18px' };

  const childClass = isMobile
    ? 'text-gray-900 font-semibold truncate text-base'
    : 'text-gray-900 font-semibold truncate';

  const childStyle = isMobile ? undefined : { fontSize: '20px', letterSpacing: '-0.5px' };

  return (
    <div className={containerClass}>
      <div
        className={`${isMobile ? '' : 'min-w-0 '}flex items-center gap-1.5${isMobile ? ' min-w-0' : ''}`}
      >
        {breadcrumbChild ? (
          <ParentLabel
            href={breadcrumbParentHref}
            title={breadcrumbParentTitle}
            className={parentClass}
            style={parentStyle}
          />
        ) : pageInfo.title ? (
          <h1 className={titleClass} style={titleStyle}>
            {pageInfo.title}
          </h1>
        ) : (
          pageInfo.icon && (
            <div className="flex-shrink-0 opacity-90 scale-90 origin-left">{pageInfo.icon}</div>
          )
        )}
        {breadcrumbChild && (
          <>
            <span className={separatorClass} style={separatorStyle}>
              /
            </span>
            <h1 className={childClass} style={childStyle} title={breadcrumbChild}>
              {truncateText(breadcrumbChild)}
            </h1>
          </>
        )}
      </div>
    </div>
  );
};
