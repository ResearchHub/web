'use client'

import { 
  Home, Coins, GraduationCap, Store, BookOpen, 
  Star, FlaskConical, AlertCircle
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FooterLinks } from '../../components/FooterLinks';
import { Navigation } from './Navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleUnimplementedFeature = (featureName: string) => {
    toast((t) => (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5" />
        <span>Implementation coming soon</span>
      </div>
    ), {
      duration: 2000,
      position: 'bottom-right',
      style: {
        background: '#FFF7ED',
        color: '#EA580C',
        border: '1px solid #FDBA74',
      },
    });
  };

  return (
    <div className="w-64 fixed h-screen border-r overflow-y-auto flex flex-col z-50 bg-white">
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <FlaskConical className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            ResearchHub
          </h1>
        </div>
      </div>

      <div className="flex-1">
        <div className="px-2 py-4">
          <Navigation 
            currentPath={pathname}
            onUnimplementedFeature={handleUnimplementedFeature}
          />
        </div>
      </div>

      <FooterLinks />
    </div>
  );
};
