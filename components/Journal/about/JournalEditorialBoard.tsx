import React from 'react';
import { EditorCard } from './EditorCard';
import { editors, Editor } from '../lib/journalConstants';

export const JournalEditorialBoard = () => {
  return (
    <div className="bg-white py-16 px-4 border-t border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium text-gray-900 mb-4 text-left">Editorial Board</h2>
          <p className="text-lg text-gray-600 text-left">
            Our goal at ResearchHub is to drive scientific progress by introducing innovative reward
            systems that compensate peer reviewers for their contributions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {editors.map((editor: Editor) => (
            <EditorCard key={editor.name} editor={editor} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
