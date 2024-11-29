'use client'

import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      setOpacity(1);
      const timer = setTimeout(() => {
        setOpacity(0);
        setTimeout(onComplete, 500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || !mounted) return null;

  const transitionContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-indigo-600
        transition-opacity duration-500 ease-in-out z-[99999]"
      style={{ opacity }}
    >
      <div className={`transform transition-transform duration-700 ease-in-out ${
        opacity === 1 ? 'scale-100' : 'scale-50'
      }`}>
        <div className="flex flex-col items-center space-y-4">
          <FlaskConical className="h-16 w-16 text-white" />
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-in-out"
              style={{ width: opacity === 1 ? '100%' : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(transitionContent, document.body);
}; 