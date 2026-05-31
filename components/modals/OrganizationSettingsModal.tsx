'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2, X, ChevronDown, Check } from 'lucide-react';
import { isValidEmail } from '@/utils/validation';
import { toast } from 'react-hot-toast';
import { Dropdown, DropdownItem } from '../ui/form/Dropdown';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import {
  useInviteUserToOrg,
  useRemoveUserFromOrg,
  useUpdateUserPermissions,
  useRemoveInvitedUserFromOrg,
} from '@/hooks/useOrganization';
import { useSession } from 'next-auth/react';
import { useNotebookContext } from '@/contexts/NotebookContext';

interface OrganizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserItem = {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  role: string;
  type: 'member' | 'invite';
};

const UserRow = ({
  user,
  index,
  totalCount,
  onRoleChange,
  onRemove,
  isRemovingUser,
  isUpdatingPermissions,
  sessionUserId,
  isCurrentUserAdmin,
}: {
  user: UserItem;
  index: number;
  totalCount: number;
  onRoleChange?: (id: string, role: 'Admin' | 'Member') => void;
  onRemove: (id: string) => void;
  isRemovingUser: boolean;
  isUpdatingPermissions: boolean;
  sessionUserId?: string;
  isCurrentUserAdmin: boolean;
}) => {
  const isCurrentUser = () => {
    if (!sessionUserId || user.type === 'invite') return false;
    return sessionUserId === user.id.toString();
  };

  return (
    <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <Avatar
          src={user.profileImage}
          alt={user.fullName}
          size="md"
          className="bg-gradient-to-br from-indigo-500 to-purple-500"
        />
        <div>
          <div className="font-medium">
            {user.fullName}
            {isCurrentUser() && (
              <span className="ml-1 text-indigo-600 font-semibold italic text-sm">(You)</span>
            )}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
          {user.type === 'invite' && (
            <div className="text-xs text-amber-600 mt-1">Pending invitation</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user.type === 'member' ? (
          isCurrentUser() ? (
            <div className="text-sm font-bold px-3">{user.role}</div>
          ) : isCurrentUserAdmin ? (
            <Dropdown
              anchor={index === totalCount - 1 ? 'top end' : 'bottom end'}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium bg-gray-100 border border-gray-200 rounded-md py-1 px-3"
                  disabled={isRemovingUser || isUpdatingPermissions}
                >
                  {isUpdatingPermissions ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      {user.role}
                    </div>
                  ) : (
                    <>
                      {user.role}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              }
              className="p-1 min-w-[250px]"
            >
              <DropdownItem
                onClick={() => onRoleChange && onRoleChange(user.id, 'Admin')}
                className={user.role === 'Admin' ? 'bg-gray-100' : ''}
                disabled={isUpdatingPermissions || isRemovingUser}
              >
                <div className="flex items-center gap-2">
                  <span>Admin</span>
                  {user.role === 'Admin' && <Check className="h-4 w-4 text-indigo-500" />}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => onRoleChange && onRoleChange(user.id, 'Member')}
                className={user.role === 'Member' ? 'bg-gray-100' : ''}
                disabled={isUpdatingPermissions || isRemovingUser}
              >
                <div className="flex items-center gap-2">
                  <span>Member</span>
                  {user.role === 'Member' && <Check className="h-4 w-4 text-indigo-500" />}
                </div>
              </DropdownItem>
              <div className="border-t border-gray-100 my-1"></div>
              <DropdownItem
                onClick={() => onRemove(user.id)}
                disabled={isRemovingUser || isUpdatingPermissions}
              >
                <div className="flex items-center gap-2 text-red-600">
                  {isRemovingUser ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <span>Remove from organization</span>
                  )}
                </div>
              </DropdownItem>
            </Dropdown>
          ) : (
            <div className="text-sm font-medium px-3">{user.role}</div>
          )
        ) : isCurrentUserAdmin ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-red-600 hover:bg-red-50"
            onClick={() => onRemove(user.id)}
            disabled={isRemovingUser}
          >
            {isRemovingUser ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              'Cancel invitation'
            )}
          </Button>
        ) : (
          <div className="text-sm text-gray-500 px-3">Pending</div>
        )}
      </div>
    </div>
  );
};

export function OrganizationSettingsModal({ isOpen, onClose }: OrganizationSettingsModalProps) {
  const { selectedOrg: organization } = useOrganizationContext();
  const { users: orgUsers, refreshUsers } = useNotebookContext();
  const { data: session } = useSession();
  const [{ isLoading: isInvitingUser }, inviteUserToOrg] = useInviteUserToOrg();
  const [{ isLoading: isRemovingUser }, removeUserFromOrg] = useRemoveUserFromOrg();
  const [{ isLoading: isUpdatingPermissions }, updateUserPermissions] = useUpdateUserPermissions();
  const [{ isLoading: isRemovingInvitedUser }, removeInvitedUserFromOrg] =
    useRemoveInvitedUserFromOrg();

  const [inviteEmail, setInviteEmail] = useState('');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // Trust the org-level permission (the same authoritative signal used to gate
  // opening this modal). Re-deriving admin from the get_organization_users
  // response + session id was fragile: it broke whenever that list hadn't
  // loaded, bucketed the user under "members", or used a mismatched id format,
  // disabling every control even for a real admin.
  const isCurrentUserAdmin = organization?.userPermission?.accessType === 'ADMIN';

  const members =
    orgUsers?.users.map((user) => ({
      id: user.id,
      fullName: user.name,
      email: user.email,
      profileImage: user.avatarUrl,
      role: user.role === 'ADMIN' ? 'Admin' : 'Member',
    })) || [];

  const invites =
    orgUsers?.invites.map((invite) => ({
      id: invite.id,
      fullName: invite.name,
      email: invite.email,
      role: invite.role,
    })) || [];

  // Transform members and invites to UserItem type
  const memberItems: UserItem[] = members.map((member) => ({
    ...member,
    type: 'member' as const,
  }));

  const inviteItems: UserItem[] = invites.map((invite) => ({
    ...invite,
    profileImage: undefined,
    type: 'invite' as const,
  }));

  // Combine all users
  const allUsers = [...memberItems, ...inviteItems];

  const handleInviteUser = async () => {
    if (!isValidEmail(inviteEmail)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (!organization) {
      toast.error('Organization not found');
      return;
    }

    if (!isCurrentUserAdmin) {
      toast.error('Only admins can invite users');
      return;
    }

    try {
      await inviteUserToOrg(organization.id, inviteEmail);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      // Refresh the organization users list to show the new invite
      refreshUsers(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite user');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!organization) return;
    if (!isCurrentUserAdmin) {
      toast.error('Only admins can remove members');
      return;
    }

    setActiveUserId(userId);

    try {
      // Check if it's an invite or a member
      const isInvite = userId.startsWith('invite-');

      if (isInvite) {
        const email = invites.find((invite) => invite.id === userId)?.email;
        if (email) {
          await removeInvitedUserFromOrg(organization.id, email);
          toast.success('Invitation cancelled successfully');
        }
      } else {
        await removeUserFromOrg(organization.id, userId);
        toast.success('Member removed successfully');
      }

      refreshUsers(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove user');
    } finally {
      setActiveUserId(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'Admin' | 'Member') => {
    if (!organization) return;
    if (!isCurrentUserAdmin) {
      toast.error('Only admins can change user roles');
      return;
    }

    setActiveUserId(memberId);

    const accessType = newRole === 'Admin' ? 'ADMIN' : 'VIEWER';

    try {
      await updateUserPermissions(organization.id, memberId, accessType);
      toast.success(`User role updated to ${newRole}`);
      refreshUsers(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    } finally {
      setActiveUserId(null);
    }
  };

  if (!organization) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[100]"
        onClose={() => {
          onClose();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black !bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title as="h2" className="text-2xl font-semibold text-gray-900">
                      Manage Members
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="border-t border-gray-200 -mx-6 mb-6" />

                  {/* Invite Users */}
                  {isCurrentUserAdmin && (
                    <div className="mb-8">
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (isCurrentUserAdmin) {
                            handleInviteUser();
                          }
                        }}
                      >
                        <Input
                          placeholder="User's email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="flex-grow min-w-[400px] h-9"
                          disabled={isInvitingUser || !isCurrentUserAdmin}
                        />
                        <Button
                          type="submit"
                          disabled={!isCurrentUserAdmin || !inviteEmail.trim() || isInvitingUser}
                          className="h-9"
                        >
                          {isInvitingUser ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Inviting...
                            </>
                          ) : (
                            'Invite'
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Organization Users */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Organization members:
                    </h3>
                    <div className="space-y-4">
                      {allUsers.length > 0 ? (
                        allUsers.map((user, index) => (
                          <UserRow
                            key={user.id}
                            user={user}
                            index={index}
                            totalCount={allUsers.length}
                            onRoleChange={
                              user.type === 'member' && isCurrentUserAdmin
                                ? handleRoleChange
                                : undefined
                            }
                            onRemove={handleRemove}
                            isRemovingUser={
                              (isRemovingUser || isRemovingInvitedUser) && activeUserId === user.id
                            }
                            isUpdatingPermissions={
                              isUpdatingPermissions && activeUserId === user.id
                            }
                            sessionUserId={session?.userId}
                            isCurrentUserAdmin={isCurrentUserAdmin}
                          />
                        ))
                      ) : (
                        <div className="text-gray-500 italic">
                          No members or pending invitations
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
