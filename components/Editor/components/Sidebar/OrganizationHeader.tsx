import { ChevronDown, Check, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Organization } from '@/types/organization';

interface OrganizationHeaderProps {
  selectedOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  error: Error | null;
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onOrgSelect: (org: Organization) => void;
}

/**
 * The organization header section of the sidebar with dropdown
 */
export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({
  selectedOrg,
  organizations,
  isLoading,
  error,
  isDropdownOpen,
  onDropdownToggle,
  onOrgSelect,
}) => {
  return (
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
            onClick={onDropdownToggle}
            className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Avatar
                src={selectedOrg?.coverImage}
                alt={selectedOrg?.name || ''}
                size="sm"
                className="bg-gradient-to-br from-indigo-500 to-purple-500"
              />
              <span className="font-medium truncate">{selectedOrg?.name}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onOrgSelect(org)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <Avatar
                      src={org.coverImage}
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
                {selectedOrg.memberCount} {selectedOrg.memberCount === 1 ? 'member' : 'members'}
              </span>
            )
          )}
        </Button>
      </div>
    </div>
  );
};
