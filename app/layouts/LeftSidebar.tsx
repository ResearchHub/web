'use client'

import { 
  Home, Coins, GraduationCap, Store, BookOpen, 
  Star, BadgeCheck, FlaskConical, Notebook, ChevronDown,
  AlertCircle 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FooterLinks } from '../../components/FooterLinks';
import { Navigation } from './Navigation';
import { useState } from 'react';
import NotebookSidebar from '../notebook/layout/LeftSidebar';
import { NotebookTransition } from '../../components/transitions/NotebookTransition';
import { NotebookToggle } from '@/components/shared/NotebookToggle';
import toast from 'react-hot-toast';

interface LeftSidebarProps {
  isPublishMenuOpen: boolean;
  onPublishMenuChange: (isOpen: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isPublishMenuOpen, 
  onPublishMenuChange 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isNotebookView, setIsNotebookView] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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
        background: '#FFF7ED', // Orange-50
        color: '#EA580C',     // Orange-600
        border: '1px solid #FDBA74', // Orange-300
      },
    });
  };

  const handleToggleView = () => {
    if (isNotebookView) {
      setIsExiting(true);
      setIsTransitioning(true);
    } else {
      setIsExiting(false);
      setIsTransitioning(true);
    }
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    const newPath = isExiting ? '/' : '/notebook';
    setIsNotebookView(!isExiting);
    router.push(newPath);
  };

  return (
    <>
      <NotebookTransition 
        isActive={isTransitioning} 
        onComplete={handleTransitionComplete}
        isExit={isExiting}
      />

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
              isPublishMenuOpen={isPublishMenuOpen}
              onPublishMenuChange={onPublishMenuChange}
              onUnimplementedFeature={handleUnimplementedFeature}
            />
          </div>
        </div>

        <div className="mt-auto">
          <NotebookToggle isNotebookView={false} />
        </div>

        <FooterLinks />
      </div>
    </>
  );
};
