'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PublishMenuProps {
  children?: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/create')}
      className="flex items-center px-4 py-3 gap-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-50 text-sm font-medium text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px]"
    >
      <Plus className="h-5 w-5 stroke-[1.5]" />
      <span>New</span>
    </button>
  );
};
