'use client';

import dynamic from 'next/dynamic';
import NotebookLayout from './layout/NotebookLayout';

// Dynamically import the Editor component to avoid SSR issues
const Editor = dynamic(() => import('../components/Editor/Editor'), {
  ssr: false, // Disable server-side rendering
  loading: () => (
    <div className="h-[500px] flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  ),
});

export default function NotebookPage() {
  return (
    <NotebookLayout>
      <div className="w-full h-full flex-1">
        <div className="max-w-[1200px] w-full mx-auto p-6 h-full">
          <div className="editor-wrapper h-full">
            <Editor />
          </div>
        </div>
      </div>
    </NotebookLayout>
  );
}