'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Avatar } from '@/components/ui/Avatar';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Organization } from '@/types/organization';

interface OrganizationMember {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  role: 'Admin' | 'Member';
}

interface OrganizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  members: OrganizationMember[];
}

export function OrganizationSettingsModal({
  isOpen,
  onClose,
  organization,
  members,
}: OrganizationSettingsModalProps) {
  const [orgName, setOrgName] = useState(organization.name);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleUpdateOrganization = () => {
    console.log('Updating organization name to:', orgName);
    // Here you would call an API to update the organization name
  };

  const handleInviteUser = () => {
    console.log('Inviting user with email:', inviteEmail);
    setInviteEmail('');
    // Here you would call an API to invite the user
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('Removing member with ID:', memberId);
    // Here you would call an API to remove the member
  };

  const handleRoleChange = (memberId: string, newRole: 'Admin' | 'Member') => {
    console.log('Changing role for member', memberId, 'to', newRole);
    // Here you would call an API to change the member's role
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                        <Input
                          id="orgName"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="w-40 h-40 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        {organization.coverImage ? (
                          <Image
                            src={organization.coverImage}
                            alt={organization.name}
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleUpdateOrganization}>Update Organization</Button>
                    </div>
                  </div>

                  {/* Invite Users */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Invite users (optional)
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="User's email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={handleInviteUser} disabled={!inviteEmail.trim()}>
                        Invite
                      </Button>
                    </div>
                  </div>

                  {/* Organization Members */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Organization members:
                    </h3>
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={member.profileImage}
                              alt={member.fullName}
                              size="md"
                              className="bg-gradient-to-br from-indigo-500 to-purple-500"
                            />
                            <div>
                              <div className="font-medium">{member.fullName}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <select
                                className="appearance-none bg-gray-100 border border-gray-200 rounded-md py-1 px-3 pr-8 text-sm font-medium"
                                value={member.role}
                                onChange={(e) =>
                                  handleRoleChange(member.id, e.target.value as 'Admin' | 'Member')
                                }
                              >
                                <option value="Admin">Admin</option>
                                <option value="Member">Member</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg
                                  className="fill-current h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove from organization
                            </button>
                          </div>
                        </div>
                      ))}
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
