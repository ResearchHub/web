import { LucideIcon } from 'lucide-react';

interface PaperActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export function PaperActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
}: PaperActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative flex items-start gap-4 rounded-lg border-2 border-gray-200 p-4 hover:border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-indigo-100">
        <Icon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 group-hover:text-indigo-900">{title}</span>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500 group-hover:text-indigo-700">{description}</p>
      </div>
    </button>
  );
}
