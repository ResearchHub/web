'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/styles';

export interface SubtabsSection {
  id: string;
  label: string;
}

interface SubtabsNavProps {
  sections: ReadonlyArray<SubtabsSection>;
  /**
   * Approximate height of the sticky bar; used as the scroll-spy probe offset
   * and the smooth-scroll target offset on click. Defaults to the desktop bar
   * height; a few pixels of tolerance on mobile is intentional.
   */
  offset?: number;
}

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const SubtabsNav = ({ sections, offset = 56 }: SubtabsNavProps) => {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) return;

    const ids = sections.map((s) => s.id);
    const handleScroll = () => {
      const probeY = window.scrollY + offset + 40;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probeY) current = id;
      }
      setActive(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, offset]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 md:px-10 h-[52px] sm:h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Back to ResearchHub"
          className="flex items-center transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm"
        >
          <Logo size={24} className="sm:hidden" />
          <Logo size={28} className="hidden sm:block" />
        </Link>

        <nav role="tablist" aria-label="About sections" className="flex items-center gap-1">
          {sections.map((section) => {
            const isActive = active === section.id;
            return (
              <a
                key={section.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={section.id}
                href={`#${section.id}`}
                onClick={(event) => handleClick(event, section.id)}
                className={cn(
                  'px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {section.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
