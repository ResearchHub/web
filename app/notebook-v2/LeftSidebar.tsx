// app/notebook-v2/components/LeftSidebar.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export const LeftSidebar = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Organizations</h2>
        <div className="text-gray-500">Organization list placeholder</div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        <div className="space-y-2">
          {Array.from({ length: 40 }).map((_, index) => (
            <div
              key={index}
              className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-medium">Note {index + 1}</div>
              <div className="text-xs text-gray-500">
                Last edited: {new Date().toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        <button
          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-center"
          onClick={() => {
            console.log('Create new note');
          }}
        >
          + New Note
        </button>
      </div>
    </div>
  );
};
