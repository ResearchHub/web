import Link from 'next/link';
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
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <span>{doi}</span>
      </Link>
    </section>
  );
};
