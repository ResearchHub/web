'use client';

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineFinalReview: React.FC<Props> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="bg-white border border-green-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-700">
        <Check size={18} strokeWidth={2.5} />
        <p className="text-sm font-semibold">All required fields collected!</p>
      </div>
      <p className="text-sm text-gray-600">
        Review the details above and submit when you&apos;re satisfied.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setIsSubmitting(true);
            onSubmit('submit', true, 'Submitted');
          }}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
            bg-green-600 text-white text-sm font-medium
            hover:bg-green-700 active:scale-[0.98] transition-all
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
        <button
          onClick={() => onSubmit('edit', false, 'Requested edits')}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
            border border-gray-300 text-gray-700 text-sm font-medium
            hover:bg-gray-50 active:scale-[0.98] transition-all
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
