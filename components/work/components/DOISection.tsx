import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

interface DOISectionProps {
  doi: string;
}

export const DOISection = ({ doi }: DOISectionProps) => {
  if (!doi) return null;

  return (
    <section>
      <SidebarHeader title="DOI" className="mb-3" />
      <Link
        href={`https://doi.org/${doi}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 text-sm text-primary-600 hover:text-blue-800 hover:underline"
      >
        <span>{doi}</span>
      </Link>
    </section>
  );
};

/**
 * A proposal's or an RFP's DOI as a card in their sidebars, in the style of
 * the cards around it, linking to doi.org. A paper's sidebar keeps DOISection.
 */
export function DOICard({ doi }: DOISectionProps) {
  return (
    <SidebarCard title="DOI">
      <a
        href={`https://doi.org/${doi}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-flex max-w-full items-start gap-1 break-all text-[13px] leading-[18px] text-primary-600 hover:text-primary-700 hover:underline"
      >
        {doi}
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      </a>
    </SidebarCard>
  );
}
