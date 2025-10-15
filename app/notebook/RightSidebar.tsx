'use client';

import { PublishingForm } from '@/app/notebook/components/PublishingForm';
import { AIChatPanel } from '@/components/LabNotebook/AIChatPanel';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { ResizeHandle } from './components/ResizeHandle';
import { Sparkles } from 'lucide-react';

/**
 * Right sidebar component for the notebook layout
 * Displays tabs for Work Details and AI Assistant
 */
export const RightSidebar = () => {
  const { activeRightSidebarTab, setActiveRightSidebarTab, currentNote, setRightSidebarWidth } =
    useNotebookContext();

  const tabs = [
    { id: 'details' as const, label: 'Work Details' },
    { id: 'ai-assistant' as const, label: 'AI Assistant' },
  ];

  return (
    <div className="h-full flex flex-col relative">
      <ResizeHandle onResize={setRightSidebarWidth} side="left" />
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          const isActive = activeRightSidebarTab === tab.id;
          const isAITab = tab.id === 'ai-assistant';

          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveRightSidebarTab(tab.id);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 relative group ${
                isActive
                  ? isAITab
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 border-b-2 border-transparent'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isAITab
                    ? 'text-gray-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 hover:bg-gray-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {isAITab && (
                  <Sparkles
                    className={`h-4 w-4 transition-all duration-200 ${
                      isActive
                        ? 'text-purple-600 animate-pulse'
                        : 'text-gray-400 group-hover:text-purple-500'
                    }`}
                  />
                )}
                <span>{tab.label}</span>
              </div>
              {/* Gradient border for active AI tab */}
              {isActive && isAITab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeRightSidebarTab === 'details' && (
          <PublishingForm bountyAmount={null} onBountyClick={() => {}} />
        )}
        {activeRightSidebarTab === 'ai-assistant' && currentNote && (
          <AIChatPanel noteId={currentNote.id} />
        )}
      </div>
    </div>
  );
};
