'use client';

import { useOrganizationContext } from '@/contexts/OrganizationContext';

export default function OrganizationPage() {
  const { selectedOrg } = useOrganizationContext();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome to {selectedOrg?.name}
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            Please select a note from the sidebar to view or edit its contents.
          </p>
          <p className="text-sm text-gray-500">
            You can also create a new note by clicking the "New Note" button in the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
