'use client';

import { Home, Coins, GraduationCap, Store, BookOpen, Star, AlertCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FooterLinks } from '../../components/FooterLinks';
import { Navigation } from './Navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PublishMenu } from './PublishMenu';
import { Logo } from '@/components/ui/Logo';

export const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleUnimplementedFeature = (featureName: string) => {
    toast(
      (t) => (
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Implementation coming soon</span>
        </div>
      ),
      {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#FFF7ED',
          color: '#EA580C',
          border: '1px solid #FDBA74',
        },
      }
    );
  };

  return (
    <div className="w-72 fixed h-screen flex flex-col z-50 bg-white">
      <div className="p-2 pl-4">
        <Logo size={38} color="text-indigo-600" />
      </div>

      <div className="px-4 mt-4">
        <PublishMenu />
      </div>

      <div className="flex-1">
        <div className="px-4 py-4">
          <Navigation
            currentPath={pathname || ''}
            onUnimplementedFeature={handleUnimplementedFeature}
          />
        </div>
      </div>

      <FooterLinks />
    </div>
  );
};
