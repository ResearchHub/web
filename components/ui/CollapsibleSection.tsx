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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
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

export function CollapsibleItem({ title, children, isOpen, onToggle, icon }: CollapsibleItemProps) {
  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="text-gray-600 group-hover:text-gray-900 transition-colors">{icon}</div>
          )}
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            {title}
          </span>
        </div>
        <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">{children}</div>
      )}
    </div>
  );
}
