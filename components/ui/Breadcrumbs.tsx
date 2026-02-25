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
  return `${label.slice(0, MAX_LABEL_LENGTH)}…`;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = item.href != null && !isLast;
          const displayLabel = truncateLabel(item.label);

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden className="text-gray-400">
                  /
                </span>
              )}
              {isLink ? (
                <Link
                  href={item.href!}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {displayLabel}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{displayLabel}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
