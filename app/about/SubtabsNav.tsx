'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/styles';
import { AboutContainer } from './AboutContainer';

export interface SubtabsSection {
  id: string;
  label: string;
}

interface SubtabsNavProps {
  sections: ReadonlyArray<SubtabsSection>;
  offset?: number;
}

const prefersReducedMotion = () =>
  globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const SubtabsNav = ({ sections, offset = 56 }: SubtabsNavProps) => {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    if (sections.length === 0) return;

    const ids = sections.map((s) => s.id);
    let rafId = 0;

    const updateActiveSection = () => {
      const probeY = globalThis.scrollY + offset + 40;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probeY) current = id;
      }
      setActive(current);
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    globalThis.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      globalThis.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [sections, offset]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;

      const top = el.getBoundingClientRect().top + globalThis.scrollY - offset;
      globalThis.scrollTo({
        top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
      globalThis.history.replaceState(null, '', `#${id}`);
    },
    [offset]
  );

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <AboutContainer className="h-[52px] sm:h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Back to ResearchHub"
          className="flex items-center transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm"
        >
          <Logo size={24} className="sm:hidden" />
          <Logo size={28} className="hidden sm:block" />
        </Link>

        <nav aria-label="About sections" className="flex items-center gap-1">
          {sections.map((section) => {
            const isActive = active === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
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
      </AboutContainer>
    </div>
  );
};
