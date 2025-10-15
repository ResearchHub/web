'use client';

import { PublishingForm } from '@/app/notebook/components/PublishingForm';
import { AIChatPanel } from '@/components/LabNotebook/AIChatPanel';
import { useNotebookContext } from '@/contexts/NotebookContext';

/**
 * Right sidebar component for the notebook layout
 * Displays tabs for Work Details and AI Assistant
 */
export const RightSidebar = () => {
  const { activeRightSidebarTab, setActiveRightSidebarTab, currentNote } = useNotebookContext();

  const tabs = [
    { id: 'details' as const, label: 'Work Details' },
    { id: 'ai-assistant' as const, label: 'AI Assistant' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.preventDefault();
              setActiveRightSidebarTab(tab.id);
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeRightSidebarTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
