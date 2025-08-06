'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  badge?: number;
  badgeColor?: 'blue' | 'purple' | 'green' | 'indigo';
  description?: string; // New prop for collapsed state description
}

export function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  className = '',
  badge,
  badgeColor = 'blue',
  description,
}: CollapsibleSectionProps) {
  const badgeColors = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className={className}>
      <button
        onClick={onToggle}
        className="flex items-start justify-between w-full hover:bg-gray-50 rounded-lg p-2 -m-2 transition-all duration-200"
      >
        <div className="flex gap-2 flex-1">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">{title}</h4>
              {badge !== undefined && badge > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${badgeColors[badgeColor]}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="mt-0.5">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ willChange: 'height, opacity' }}
            layout
          >
            <div className="mt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CollapsibleItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}

export function CollapsibleItem({
  title,
  icon = <ChevronRight className="w-4 h-4" />,
  isOpen = false,
  children,
}: CollapsibleItemProps) {
  return (
    <div>
      <div
        className={`
          flex items-start gap-2.5 py-2.5 rounded-lg transition-all
          ${isOpen ? 'text-gray-900' : 'text-gray-600'}
        `}
      >
        <div className="text-primary-600 mt-0.5 flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">{title}</div>
          {isOpen && <div className="text-xs text-gray-600 leading-relaxed">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// Simple wrapper that manages its own state
interface SimpleCollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export function SimpleCollapsibleSection({
  title,
  children,
  className = '',
  defaultExpanded = true,
}: SimpleCollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <CollapsibleSection
      title={title}
      icon={<ChevronDown className="w-5 h-5" />}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      className={className}
    >
      {children}
    </CollapsibleSection>
  );
}
