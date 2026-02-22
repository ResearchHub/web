import { ReactNode } from 'react';

interface NoteCreationPopoverProps {
  isOpen: boolean;
  children?: ReactNode;
}

export const NoteCreationPopover = ({ isOpen, children }: NoteCreationPopoverProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Creating Note</h3>
            <div className="h-5 overflow-hidden">
              <p className="text-sm text-gray-600">Please wait...</p>
            </div>
          </div>
        </div>
        {children && <div className="mt-4 pt-4 border-t border-gray-200">{children}</div>}
      </div>
    </div>
  );
};
