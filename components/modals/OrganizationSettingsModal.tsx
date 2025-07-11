'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Avatar } from '@/components/ui/Avatar';
import Image from 'next/image';
import { Loader2, X, Camera, ChevronDown, Check } from 'lucide-react';
import { isValidEmail } from '@/utils/validation';
import { toast } from 'react-hot-toast';
import { Dropdown, DropdownItem } from '../ui/form/Dropdown';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import {
  useUpdateOrgDetails,
  useInviteUserToOrg,
  useRemoveUserFromOrg,
  useUpdateUserPermissions,
  useRemoveInvitedUserFromOrg,
  useUpdateOrgCoverImage,
} from '@/hooks/useOrganization';
import { useSession } from 'next-auth/react';
import { ImageUploadModal } from '@/components/modals/ImageUploadModal';
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
  const { selectedOrg: organization, refreshOrganizations } = useOrganizationContext();
  const { users: orgUsers, refreshUsers } = useNotebookContext();
  const { data: session } = useSession();
  const [{ isLoading: isUpdatingOrgName }, updateOrgDetails] = useUpdateOrgDetails();
  const [{ isLoading: isInvitingUser }, inviteUserToOrg] = useInviteUserToOrg();
  const [{ isLoading: isRemovingUser }, removeUserFromOrg] = useRemoveUserFromOrg();
  const [{ isLoading: isUpdatingPermissions }, updateUserPermissions] = useUpdateUserPermissions();
  const [{ isLoading: isRemovingInvitedUser }, removeInvitedUserFromOrg] =
    useRemoveInvitedUserFromOrg();
  const [
    { isLoading: isUpdatingOrgCoverImage, error: updateOrgCoverImageError },
    updateOrgCoverImage,
  ] = useUpdateOrgCoverImage();

  const [orgName, setOrgName] = useState(organization?.name || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);

  const isCurrentUserAdmin = (() => {
    if (!session?.userId || !orgUsers?.users) return false;

    const currentUser = orgUsers.users.find((user) => user.id.toString() === session.userId);

    return currentUser?.role === 'ADMIN';
  })();

  useEffect(() => {
    setOrgName(organization?.name || '');
  }, [organization]);

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

  const handleUpdateOrganization = useCallback(async () => {
    try {
      if (!organization) throw new Error('Organization not found');
      if (!isCurrentUserAdmin) throw new Error('Only admins can update organization details');

      await updateOrgDetails(organization.id.toString(), orgName);
      toast.success('Organization updated successfully');
      refreshOrganizations(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [updateOrgDetails, organization?.id, orgName, isCurrentUserAdmin]);

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

  const handleUpdateOrgCoverImage = async (blob: Blob) => {
    if (!organization) return Promise.reject(new Error('Organization not found'));

    try {
      const updatedOrg = await updateOrgCoverImage(organization.id.toString(), blob);
      refreshOrganizations(true);
      return updatedOrg;
    } catch (error) {
      console.error('Error updating cover image:', error);
      throw error;
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
                      Settings & Members
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

                  {/* Organization Name */}
                  <div className="mb-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-grow">
                        <label
                          htmlFor="orgName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Organization Name<span className="text-red-500">*</span>
                        </label>
                        <form
                          className="flex items-stretch gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!isUpdatingOrgName && isCurrentUserAdmin) {
                              handleUpdateOrganization();
                            }
                          }}
                        >
                          <Input
                            id="orgName"
                            autoComplete="off"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="h-9"
                            wrapperClassName="w-full"
                            disabled={!isCurrentUserAdmin}
                            error={orgName === '' ? 'Organization name is required' : ''}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="secondary"
                            disabled={
                              !isCurrentUserAdmin ||
                              isUpdatingOrgName ||
                              !orgName.trim() ||
                              orgName === organization.name
                            }
                            className="flex-shrink-0 h-9 px-2"
                          >
                            {isUpdatingOrgName ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </Button>
                        </form>
                      </div>
                      <div
                        className="w-40 h-40 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex-shrink-0 relative group cursor-pointer"
                        onClick={() => isCurrentUserAdmin && setIsAvatarUploadOpen(true)}
                      >
                        {organization.coverImage ? (
                          <>
                            <Image
                              src={organization.coverImage}
                              alt={organization.name}
                              width={100}
                              height={100}
                              className="object-cover w-full h-full"
                            />
                            {isCurrentUserAdmin && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                <Camera className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 rounded-full">
                            {isCurrentUserAdmin ? (
                              <div className="flex flex-col items-center">
                                <Camera className="h-6 w-6 mb-1" />
                                <span className="text-xs">Add Image</span>
                              </div>
                            ) : (
                              <span>No Image</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Invite Users */}
                  {isCurrentUserAdmin && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Invite users (optional)
                      </h3>
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
      {isAvatarUploadOpen && (
        <ImageUploadModal
          isOpen={isAvatarUploadOpen}
          onClose={() => setIsAvatarUploadOpen(false)}
          onSave={handleUpdateOrgCoverImage}
          isLoading={isUpdatingOrgCoverImage}
          error={updateOrgCoverImageError}
        />
      )}
    </Transition>
  );
}
