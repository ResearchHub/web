import type { PageInfo } from './pageRoutes';

interface TopBarBreadcrumbProps {
  pageInfo: PageInfo;
  variant: 'mobile' | 'desktop';
}

export const TopBarBreadcrumb = ({ pageInfo, variant }: TopBarBreadcrumbProps) => {
  const isMobile = variant === 'mobile';

  const containerClass = isMobile
    ? 'flex tablet:!hidden items-center min-w-0'
    : 'hidden tablet:!flex items-center min-w-0';

  const titleClass = isMobile
    ? 'leading-tight flex-shrink-0 font-semibold text-gray-900 text-lg'
    : 'leading-tight flex-shrink-0 font-semibold text-gray-900';

  const titleStyle = isMobile ? undefined : { fontSize: '24px', letterSpacing: '-0.5px' };

  return (
    <div className={containerClass}>
      <div
        className={`${isMobile ? '' : 'min-w-0 '}flex items-center gap-1.5${isMobile ? ' min-w-0' : ''}`}
      >
        {pageInfo.title ? (
          <h1 className={titleClass} style={titleStyle}>
            {pageInfo.title}
          </h1>
        ) : (
          pageInfo.icon && (
            <div className="flex-shrink-0 opacity-90 scale-90 origin-left">{pageInfo.icon}</div>
          )
        )}
      </div>
    </div>
  );
};
