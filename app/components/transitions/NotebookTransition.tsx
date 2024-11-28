'use client'

import { useEffect, useState } from 'react';
import { Beaker } from 'lucide-react';

interface NotebookTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  isExit?: boolean;
}

export const NotebookTransition: React.FC<NotebookTransitionProps> = ({ 
  isActive, 
  onComplete,
  isExit = false 
}) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isActive) {
      setOpacity(1);
      const timer = setTimeout(() => {
        setOpacity(0);
        setTimeout(onComplete, 500); // Wait for fade out before completing
      }, 1000); // Show for 1 second
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-indigo-600
        transition-opacity duration-500 ease-in-out`}
      style={{ opacity }}
    >
      <div className={`transform transition-transform duration-700 ease-in-out ${
        opacity === 1 ? 'scale-100' : 'scale-50'
      }`}>
        <div className="flex flex-col items-center space-y-4">
          <Beaker className="h-16 w-16 text-white" />
          <div className="text-white text-2xl font-bold">
            {isExit ? 'Exiting' : 'Entering'} Lab Notebook
          </div>
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-in-out"
              style={{ 
                width: opacity === 1 ? '100%' : '0%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 