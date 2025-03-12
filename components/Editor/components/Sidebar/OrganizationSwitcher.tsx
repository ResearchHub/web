'use client';

import { ChevronDown, Settings, Check, Lock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Organization } from '@/types/organization';
import { OrganizationSwitcherSkeleton } from '@/components/skeletons/OrganizationSwitcherSkeleton';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useState } from 'react';
import { OrganizationSettingsModal } from '@/components/modals/OrganizationSettingsModal';

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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const isCurrentUserAdmin = selectedOrg?.userPermission?.accessType === 'ADMIN';

  if (isLoading || !selectedOrg) {
    return <OrganizationSwitcherSkeleton />;
  }

  const handleOrgSelect = async (org: Organization) => {
    // If the selected organization is already active, just close the list
    if (org.slug === selectedOrg?.slug) {
      return;
    }

    // Trigger callback to inform parent container about the organization change
    await onOrgSelect(org);
  };

  const trigger = (
    <button className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Avatar
          src={selectedOrg.coverImage}
          alt={selectedOrg.name}
          size="sm"
          className="bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0"
        />
        <span className="font-medium truncate overflow-hidden text-ellipsis max-w-[150px]">
          {selectedOrg.name}
        </span>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-1" />
    </button>
  );

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <BaseMenu trigger={trigger} align="start" className="w-full" sameWidth>
          {organizations.map((org) => {
            const isSelected = org.slug === selectedOrg?.slug;
            return (
              <BaseMenuItem
                key={org.id}
                onClick={() => handleOrgSelect(org)}
                className={isSelected ? 'bg-gray-50 cursor-default' : ''}
              >
                <div className="flex items-center gap-2 w-full justify-between">
                  <div className="flex items-center gap-2 w-full">
                    <Avatar
                      src={org.coverImage}
                      alt={org.name}
                      size="sm"
                      className="bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0"
                    />
                    <span className={`font-medium truncate ${isSelected ? 'text-indigo-600' : ''}`}>
                      {org.name}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                  </div>
                </div>
              </BaseMenuItem>
            );
          })}
        </BaseMenu>
      </div>

      <div className="mt-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto"
          onClick={() => setIsSettingsModalOpen(true)}
          disabled={!isCurrentUserAdmin}
          title={!isCurrentUserAdmin ? 'Only admins can manage organization settings' : ''}
        >
          <div className="flex items-center gap-2">
            {isCurrentUserAdmin ? (
              <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-900" />
            ) : (
              <Lock className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={`${isCurrentUserAdmin ? 'text-gray-600 group-hover:text-gray-900' : 'text-gray-400'}`}
            >
              Manage
            </span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-600 whitespace-nowrap">
            {selectedOrg.memberCount} {selectedOrg.memberCount === 1 ? 'member' : 'members'}
          </span>
        </Button>
      </div>

      {selectedOrg && isCurrentUserAdmin && (
        <OrganizationSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};
