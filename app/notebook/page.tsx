'use client';

import dynamic from 'next/dynamic';

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
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Notebook</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="editor-wrapper">
          <Editor />
        </div>
      </div>
    </div>
  );
}