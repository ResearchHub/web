'use client';

import { Plus, ChevronDown, File, Folder, Settings, BookOpen, Star } from 'lucide-react';

const sampleDocuments = [
  {
    name: 'Neural Network Architecture',
    type: 'research',
    icon: File,
  },
  {
    name: 'CRISPR Gene Editing Protocol',
    type: 'protocol',
    icon: BookOpen,
  },
  {
    name: 'Quantum Computing Review',
    type: 'review',
    icon: Star,
  },
  {
    name: 'Lab Meeting Notes',
    type: 'notes',
    icon: File,
  },
  {
    name: 'RNA Sequencing Data',
    type: 'data',
    icon: File,
  }
];

const privateDocuments = [
  {
    name: 'Grant Proposal Draft',
    type: 'draft',
    icon: File,
  },
  {
    name: 'Research Ideas 2024',
    type: 'notes',
    icon: Star,
  }
];

const LeftSidebar: React.FC = () => (
  <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
    {/* Organization Header */}
    <div className="p-4 border-b border-gray-200">
      <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
            SO
          </div>
          <span className="font-medium">SOME ORG 2021</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
      
      <div className="mt-3 space-y-1">
        <button className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings & Members
        </button>
      </div>
    </div>

    {/* Workspace Section */}
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">WORKSPACE</span>
        <button className="w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center">
          <Plus className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="space-y-1">
        {sampleDocuments.map((doc, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md group"
          >
            <doc.icon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
            <span className="truncate">{doc.name}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Private Section */}
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">PRIVATE</span>
        <button className="w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center">
          <Plus className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="space-y-1">
        {privateDocuments.map((doc, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md group"
          >
            <doc.icon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
            <span className="truncate">{doc.name}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default LeftSidebar;