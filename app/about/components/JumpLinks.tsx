'use client';

import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

interface JumpLink {
  label: string;
  href: string;
}

interface JumpLinksProps {
  links: ReadonlyArray<JumpLink>;
  offset?: number;
}

const NAV_HEIGHT = 56;

export const JumpLinks = ({ links, offset = NAV_HEIGHT }: JumpLinksProps) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (!el) return;

      event.preventDefault();
      const top = el.getBoundingClientRect().top + globalThis.scrollY - offset;
      const prefersReduced = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
      globalThis.scrollTo({
        top,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
      globalThis.history.replaceState(null, '', href);
    },
    [offset]
  );

  return (
    <ul className="space-y-2 text-[15px]">
      {links.map(({ label, href }) => (
        <li key={href}>
          <a
            href={href}
            onClick={(event) => handleClick(event, href)}
            className="group flex items-center justify-between py-2.5 border-b border-white/25 text-white transition-colors"
          >
            <span>{label}</span>
            <ArrowRight
              className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition"
              aria-hidden
            />
          </a>
        </li>
      ))}
    </ul>
  );
};
