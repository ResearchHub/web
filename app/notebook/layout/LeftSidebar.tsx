'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, File, Settings, BookOpen, Star, Check, Lock } from 'lucide-react';
import { NotebookToggle } from '@/components/shared/NotebookToggle';
import { OrganizationService } from '@/services/organization.service';
import type {
  Organization, //,
  //OrganizationUser,
  //OrganizationInvite,
} from '@/services/types/organization.dto';
// import { SettingsModal } from '@/components/modals/Editor/SettingsModal';
import { useSession } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
// import { cn } from '@/utils/styles';
import type { LucideIcon } from 'lucide-react';

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
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // Commenting out organization users state as it's only used by SettingsModal
  // const [organizationUsers, setOrganizationUsers] = useState<{
  //   users: OrganizationUser[];
  //   invites: OrganizationInvite[];
  // }>({ users: [], invites: [] });
  // const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await OrganizationService.getUserOrganizations();
        setOrganizations(orgs);
        if (orgs.length > 0) {
          setSelectedOrg(orgs[0]); // Select first org by default
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
        console.error('Failed to fetch organizations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Commenting out organization users effect as it's only used by SettingsModal
  // useEffect(() => {
  //   const fetchOrganizationUsers = async () => {
  //     if (!selectedOrg || !session?.user?.id) return;

  //     setIsLoadingUsers(true);
  //     try {
  //       const data = await OrganizationService.getOrganizationUsers(
  //         String(session.user.id),
  //         String(selectedOrg.id)
  //       );
  //       setOrganizationUsers(data);
  //     } catch (error) {
  //       console.error('Failed to fetch organization users:', error);
  //     } finally {
  //       setIsLoadingUsers(false);
  //     }
  //   };

  //   fetchOrganizationUsers();
  // }, [selectedOrg, session?.user?.id]);

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
                className={`h-4 w-4 text-gray-500 transition-transform ${isOrgDropdownOpen ? 'transform rotate-180' : ''}`}
              />
            </button>

            {/* Organization Dropdown */}
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
          <Button
            onClick={() => setIsSettingsModalOpen(true)}
            variant="ghost"
            className="w-full justify-between px-3 py-2 h-auto"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-900" />
              <span className="text-gray-600 group-hover:text-gray-900">Manage</span>
            </div>
            {/* Commenting out member count since it relies on organizationUsers state */}
            {/* {isLoading || isLoadingUsers ? (
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              selectedOrg && (
                <span className="text-xs text-gray-500 group-hover:text-gray-600 whitespace-nowrap">
                  {organizationUsers.users.length}{' '}
                  {organizationUsers.users.length === 1 ? 'member' : 'members'}
                </span>
              )
            )} */}
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

      {/* Commenting out SettingsModal */}
      {/* {selectedOrg && session?.user?.id && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          organization={{
            id: String(selectedOrg.id),
            name: selectedOrg.name,
            photoUrl: selectedOrg.cover_image || undefined,
            members: [
              ...organizationUsers.users,
              ...organizationUsers.invites.map((invite) => ({
                ...invite,
                status: 'pending' as const,
              })),
            ],
          }}
          userId={String(session.user.id)}
          organizationUsers={organizationUsers}
          onOrganizationUsersChange={setOrganizationUsers}
        />
      )} */}

      {/* Fixed bottom section */}
      <div className="border-t mt-auto">
        <NotebookToggle isNotebookView={true} />
      </div>
    </div>
  );
};

export default LeftSidebar;
