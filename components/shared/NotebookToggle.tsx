'use client';

import { Notebook } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotebookTransition } from '../transitions/NotebookTransition';

interface NotebookToggleProps {
  isNotebookView: boolean;
}

export const NotebookToggle: React.FC<NotebookToggleProps> = ({ isNotebookView }) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    router.push(isNotebookView ? '/' : '/notebook');
  };

  return (
    <>
      <NotebookTransition
        isActive={isTransitioning}
        onComplete={handleTransitionComplete}
        isExit={isNotebookView}
      />

      <div className="border-t">
        <button
          onClick={handleToggle}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Notebook className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Lab Notebook</span>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
              isNotebookView ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                isNotebookView ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>
    </>
  );
};
