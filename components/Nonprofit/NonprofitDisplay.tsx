'use client';

import { NonprofitOrg } from '@/types/nonprofit';
import { Info, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Input } from '@/components/ui/form/Input';

interface NonprofitDisplayProps {
  nonprofit: NonprofitOrg;
  note: string;
  onNoteChange: (note: string) => void;
  onInfoClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClear: () => void;
  isInfoOpen: boolean;
  readOnly?: boolean;
  allowClear?: boolean;
}

/**
 * Displays a selected nonprofit organization with options to view details or clear the selection
 */
export default function NonprofitDisplay({
  nonprofit,
  note,
  onNoteChange,
  onInfoClick,
  onClear,
  isInfoOpen,
  readOnly = false,
  allowClear = false,
}: NonprofitDisplayProps) {
  return (
    <div className="mt-2 p-2 border border-gray-100 rounded-md bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h4 className="text-xs font-medium text-gray-800">{nonprofit.name}</h4>
          <p className="text-xs text-gray-500">EIN: {nonprofit.ein}</p>
        </div>
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onInfoClick}
            className={cn(
              'p-1 rounded-full hover:bg-gray-200',
              isInfoOpen ? 'text-primary-600 bg-gray-200' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Info className="h-4 w-4" />
          </button>
          {(!readOnly || allowClear) && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note field - show text in readonly mode, input field in edit mode */}
      {readOnly ? (
        note && (
          <div className="mt-2 text-xs text-gray-700">
            <span className="font-medium">Note:</span> {note}
          </div>
        )
      ) : (
        <div className="mt-2">
          <Input
            label="Note"
            placeholder="e.g., Biology Department"
            value={note || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            className="text-sm"
            helperText="Specify any additional information about your funding recipient"
          />
        </div>
      )}
    </div>
  );
}
