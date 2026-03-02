'use client';

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const MAX_LABEL_LENGTH = 50;

function truncateLabel(label: string): string {
  if (label.length <= MAX_LABEL_LENGTH) return label;
  return `${label.slice(0, MAX_LABEL_LENGTH)}...`;
}

const responsiveTextClass = 'text-sm font-semibold sm:!text-lg md:!text-2xl';

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const labelClass = `min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${responsiveTextClass}`;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={`flex flex-wrap items-center gap-2 text-gray-900 ${responsiveTextClass}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = item.href != null && !isLast;
          const displayLabel = truncateLabel(item.label);

          return (
            <li key={index} className="flex shrink-0 items-center gap-2 max-w-full">
              {isLink ? (
                <Link
                  href={item.href!}
                  className={`${labelClass} text-primary-600 hover:text-primary-700 hover:underline max-w-full`}
                >
                  {displayLabel}
                </Link>
              ) : (
                <span className={labelClass} title={displayLabel}>
                  {displayLabel}
                </span>
              )}
              {!isLast && (
                <span
                  aria-hidden
                  className={`shrink-0 text-gray-500 max-w-full ${responsiveTextClass}`}
                >
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
