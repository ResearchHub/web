import { Link2 } from 'lucide-react';
import Link from 'next/link';

interface DOISectionProps {
  doi: string;
}

export const DOISection = ({ doi }: DOISectionProps) => {
  if (!doi) return null;

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Link2 className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">DOI</h2>
      </div>
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
