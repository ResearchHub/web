'use client'

import { 
  Home, Coins, GraduationCap, Store, BookOpen, 
  Star, BadgeCheck, Beaker, Notebook, ChevronDown 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FooterLinks } from '../FooterLinks';
import { Navigation } from './Navigation';
import { useState } from 'react';
import NotebookSidebar from '../../notebook/layout/LeftSidebar';
import { NotebookTransition } from '../transitions/NotebookTransition';

export const LeftSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isNotebookView, setIsNotebookView] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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

      <div className="w-64 fixed h-screen border-r overflow-y-auto flex flex-col z-30">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Beaker className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              ResearchHub
            </h1>
          </div>
        </div>

        <div className="flex-1">
          <div className="px-2 py-4">
            <Navigation currentPath={pathname} />
          </div>
        </div>

        <div className="border-t">
          <button
            onClick={handleToggleView}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Notebook className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Lab Notebook</span>
            </div>
            <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
              isNotebookView ? 'bg-indigo-600' : 'bg-gray-200'
            }`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                isNotebookView ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>

        <FooterLinks />
      </div>
    </>
  );
};
