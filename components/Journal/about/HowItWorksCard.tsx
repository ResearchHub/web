import React, { FC, ReactNode, MouseEvent } from 'react';
import { CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface HowItWorksCardProps {
  title: string;
  content: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const HowItWorksCard: FC<HowItWorksCardProps> = ({
  title,
  content,
  isOpen,
  onToggle,
  className,
}) => {
  // Handle card click to toggle expansion
  const handleCardClick = () => {
    onToggle();
  };

  // Prevent clicks on interactive elements from triggering the toggle
  const handleContentClick = (e: MouseEvent) => {
    // Get the clicked element
    const target = e.target as HTMLElement;

    // Check if the click was on a button, anchor, or input, or inside one
    const isInteractive =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input');

    if (isInteractive) {
      // Stop propagation to prevent the card toggle
      e.stopPropagation();
    }
  };

  return (
    <div
      className={cn(
        'bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer',
        className
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="px-6 py-4">
        <div className="w-full flex items-center justify-between text-left group">
          <span className="text-lg font-medium text-gray-800">{title}</span>
          <div className="text-gray-500 transition-colors">
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 text-gray-600 leading-relaxed" onClick={handleContentClick}>
            {content}
          </div>
        )}
      </div>
    </div>
  );
};
