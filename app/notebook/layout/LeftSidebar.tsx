'use client';

import { useState } from 'react';
import { Plus, ChevronDown, File, Settings, BookOpen, Star, Check, Lock } from 'lucide-react';
import { NotebookToggle } from '@/components/shared/NotebookToggle';
import { useOrganization } from '@/hooks/useOrganization';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { LucideIcon } from 'lucide-react';
import type { Organization } from '@/services/types/organization.dto';

interface SidebarSectionProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'before' | 'after';
}

const SidebarSection = ({
  children,
  action,
  icon: Icon,
  iconPosition = 'before',
}: SidebarSectionProps) => {
  return (
    <div className="flex items-center justify-between px-2 mb-1">
      <div className="flex items-center gap-2">
        {Icon && iconPosition === 'before' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase">
          {children}
        </span>
        {Icon && iconPosition === 'after' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
};

const sampleDocuments = [
  {
    name: 'Neural Network Architecture',
    type: 'research',
    icon: File,
  },
  {
    name: 'CRISPR Gene Editing Protocol',
    type: 'protocol',
    icon: BookOpen,
  },
  {
    name: 'Quantum Computing Review',
    type: 'review',
    icon: Star,
  },
  {
    name: 'Lab Meeting Notes',
    type: 'notes',
    icon: File,
  },
  {
    name: 'RNA Sequencing Data',
    type: 'data',
    icon: File,
  },
];

const privateDocuments = [
  {
    name: 'Grant Proposal Draft',
    type: 'draft',
    icon: File,
  },
  {
    name: 'Research Ideas 2024',
    type: 'notes',
    icon: Star,
  },
];

const LeftSidebar: React.FC = () => {
  const { organizations, selectedOrg, setSelectedOrg, isLoading, error } = useOrganization();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setIsOrgDropdownOpen(false);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Organization Header */}
      <div className="p-4 border-b border-gray-200">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">Failed to load organizations</div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Avatar
                  src={selectedOrg?.cover_image}
                  alt={selectedOrg?.name || ''}
                  size="sm"
                  className="bg-gradient-to-br from-indigo-500 to-purple-500"
                />
                <span className="font-medium truncate">{selectedOrg?.name}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  isOrgDropdownOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleOrgSelect(org)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <Avatar
                        src={org.cover_image}
                        alt={org.name}
                        size="sm"
                        className="bg-gradient-to-br from-indigo-500 to-purple-500"
                      />
                      <span className="font-medium truncate">{org.name}</span>
                    </div>
                    {selectedOrg?.id === org.id && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 space-y-1">
          <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-900" />
              <span className="text-gray-600 group-hover:text-gray-900">Manage</span>
            </div>
            {isLoading ? (
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              selectedOrg && (
                <span className="text-xs text-gray-500 group-hover:text-gray-600 whitespace-nowrap">
                  {selectedOrg.member_count} {selectedOrg.member_count === 1 ? 'member' : 'members'}
                </span>
              )
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Workspace Section */}
        <div className="px-2 py-3">
          <SidebarSection
            action={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  /* Add workspace handler */
                }}
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            }
          >
            Workspace
          </SidebarSection>
          <div className="space-y-0.5">
            {sampleDocuments.map((doc, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start px-2.5 py-1.5 h-8 text-sm font-normal hover:bg-gray-50 text-gray-700 group"
              >
                <doc.icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span className="ml-2 truncate">{doc.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Private Section */}
        <div className="px-2 py-3">
          <SidebarSection
            icon={Lock}
            iconPosition="after"
            action={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  /* Add private document handler */
                }}
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            }
          >
            Private
          </SidebarSection>
          <div className="space-y-0.5">
            {privateDocuments.map((doc, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start px-2.5 py-1.5 h-8 text-sm font-normal hover:bg-gray-50 text-gray-700 group"
              >
                <doc.icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span className="ml-2 truncate">{doc.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="border-t mt-auto">
        <NotebookToggle isNotebookView={true} />
      </div>
    </div>
  );
};

export default LeftSidebar;
