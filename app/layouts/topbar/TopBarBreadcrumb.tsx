import type { PageInfo } from './pageRoutes';
import { cn } from '@/utils/styles';

interface TopBarBreadcrumbProps {
  pageInfo: PageInfo;
  variant: 'mobile' | 'desktop';
  /** Ellipsize a long title so sibling controls (e.g. sticky tab pills) stay visible. */
  truncateTitle?: boolean;
}

export const TopBarBreadcrumb = ({
  pageInfo,
  variant,
  truncateTitle = false,
}: TopBarBreadcrumbProps) => {
  const isMobile = variant === 'mobile';

  const containerClass = isMobile
    ? 'flex min-w-0 flex-1 items-center overflow-hidden tablet:!hidden'
    : 'hidden tablet:!flex items-center min-w-0';

  const titleClass = isMobile
    ? 'block min-w-0 truncate text-lg font-semibold leading-tight text-gray-900'
    : cn(
        'leading-tight font-semibold text-gray-900',
        truncateTitle ? 'min-w-0 truncate' : 'flex-shrink-0'
      );

  const titleStyle = isMobile ? undefined : { fontSize: '26px', letterSpacing: '-0.5px' };

  return (
    <div className={containerClass}>
      <div
        className={`${isMobile ? 'min-w-0 flex-1 overflow-hidden' : 'min-w-0'} flex items-center gap-1.5`}
      >
        {pageInfo.title ? (
          <span className={titleClass} style={titleStyle} title={pageInfo.title}>
            {pageInfo.title}
          </span>
        ) : (
          pageInfo.icon && (
            <div className="flex-shrink-0 opacity-90 scale-90 origin-left">{pageInfo.icon}</div>
          )
        )}
      </div>
    </div>
  );
};
