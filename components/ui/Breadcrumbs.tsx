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

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = item.href != null && !isLast;

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
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
