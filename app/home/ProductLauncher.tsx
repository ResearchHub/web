'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrid } from '@fortawesome/pro-light-svg-icons';
import { FileText, Sprout, type LucideIcon } from 'lucide-react';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';

interface LauncherProduct {
  label: string;
  href: string;
  /** Icon from the shared icon set. */
  iconName?: IconName;
  /** A lucide icon, used when there's no matching set icon (e.g. Endowment). */
  lucideIcon?: LucideIcon;
  accent: string;
}

const products: LauncherProduct[] = [
  { label: 'Endowment', href: '/endowment', lucideIcon: Sprout, accent: 'text-gray-700' },
  { label: 'Journal', href: '/journal', iconName: 'rhJournal1', accent: 'text-primary-600' },
  { label: 'Earn', href: '/earn', iconName: 'earn1', accent: 'text-amber-600' },
  { label: 'Notebook', href: '/notebook', iconName: 'labNotebook2', accent: 'text-gray-700' },
  { label: 'Preprints', href: '/preprints', lucideIcon: FileText, accent: 'text-gray-600' },
];

export function ProductLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        type="button"
        aria-label="Explore ResearchHub"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center rounded-md p-2 text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <FontAwesomeIcon icon={faGrid} className="h-7 w-7" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[280px] rounded-2xl border border-gray-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="px-2 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Explore
          </div>
          <div className="grid grid-cols-3 gap-1">
            {products.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors hover:bg-gray-50"
              >
                <span className={cn('flex h-7 items-center justify-center', product.accent)}>
                  {product.lucideIcon ? (
                    <product.lucideIcon size={24} strokeWidth={2} />
                  ) : (
                    <Icon name={product.iconName as IconName} size={26} />
                  )}
                </span>
                <span className="text-xs font-medium text-gray-700">{product.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
