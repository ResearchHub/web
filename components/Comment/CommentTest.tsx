import React, { useState } from 'react';
import { CommentProvider } from '@/contexts/CommentContext';
import { SessionProvider } from 'next-auth/react';
import CommentTestContent from './CommentTestContent';

const CommentTest = () => {
  const [documentId, setDocumentId] = useState(4873);

  // List of document IDs to test with
  const testDocumentIds = [4873, 4852, 4800, 4700];

  return (
    <SessionProvider>
      <CommentProvider documentId={documentId} contentType="paper" debug={true}>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <label className="flex items-center text-sm font-medium">
              Document ID:
              <input
                type="number"
                value={documentId}
                onChange={(e) => setDocumentId(Number(e.target.value))}
                className="ml-2 p-1 border rounded w-24 text-center"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {testDocumentIds.map((id) => (
              <button
                key={id}
                onClick={() => setDocumentId(id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  documentId === id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Test ID: {id}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded border border-blue-100">
            <p className="mb-1">Debug mode is enabled. Check the console for detailed logs.</p>
            <p>Try different document IDs to find comments with more replies to load.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <CommentTestContent />
        </div>
      </CommentProvider>
    </SessionProvider>
  );
};

export default CommentTest;
