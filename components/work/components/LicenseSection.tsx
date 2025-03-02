import { Scale } from 'lucide-react';

interface LicenseSectionProps {
  license?: string;
}

export const LicenseSection = ({ license }: LicenseSectionProps) => {
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Scale className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">License</h2>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{license || 'Unknown License'}</span>
      </div>
    </section>
  );
};
