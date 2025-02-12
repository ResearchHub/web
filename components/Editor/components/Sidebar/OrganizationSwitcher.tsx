'use client';

import { ChevronDown, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import type { Organization } from '@/types/organization';
import { OrganizationSwitcherSkeleton } from '@/components/skeletons/OrganizationSwitcherSkeleton';

interface OrganizationSwitcherProps {
  /** List of available organizations */
  organizations: Organization[];
  /** Currently selected organization */
  selectedOrg: Organization | null;
  /** Callback triggered when a new org is selected */
  onOrgSelect: (org: Organization) => Promise<void>;
  /** Optional loading flag */
  isLoading?: boolean;
}

/**
 * OrganizationSwitcher is a dumb component that simply renders the organization switcher UI.
 * It shows a dropdown list of organizations and calls the provided `onOrgSelect` callback when a user selects a new organization.
 *
 * @param props - OrganizationSwitcherProps object containing organizations, selectedOrg, onOrgSelect, and an optional isLoading flag.
 * @returns React element for the organization switcher.
 */
export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  organizations,
  selectedOrg,
  onOrgSelect,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !selectedOrg) {
    return <OrganizationSwitcherSkeleton />;
  }

  const handleOrgSelect = async (org: Organization) => {
    // If the selected organization is already active, just close the list
    if (org.slug === selectedOrg?.slug) {
      setIsOpen(false);
      return;
    }

    // Trigger callback to inform parent container about the organization change
    await onOrgSelect(org);
    setIsOpen(false);
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Avatar
              src={selectedOrg.coverImage}
              alt={selectedOrg.name}
              size="sm"
              className="bg-gradient-to-br from-indigo-500 to-purple-500"
            />
            <span className="font-medium truncate">{selectedOrg.name}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && organizations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgSelect(org)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
              >
                <Avatar
                  src={org.coverImage}
                  alt={org.name}
                  size="sm"
                  className="bg-gradient-to-br from-indigo-500 to-purple-500"
                />
                <span className="font-medium truncate">{org.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-900" />
            <span className="text-gray-600 group-hover:text-gray-900">Manage</span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-600 whitespace-nowrap">
            {selectedOrg.memberCount} {selectedOrg.memberCount === 1 ? 'member' : 'members'}
          </span>
        </Button>
      </div>
    </div>
  );
};
