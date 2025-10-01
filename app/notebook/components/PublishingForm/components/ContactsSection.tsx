import { Users, X } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { useFormContext } from 'react-hook-form';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { getFieldErrorMessage } from '@/utils/form';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/Button';
import { OrganizationMember } from '@/types/organization';
import { useInviteUserToOrg } from '@/hooks/useOrganization';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useSession } from 'next-auth/react';
import { isValidEmail } from '@/utils/validation';
import { toast } from 'react-hot-toast';
import { AuthorInfo } from '@/components/ui/AuthorInfo';

// Create a type for organization member as contact suggestion
interface OrgMemberSuggestion {
  id: string;
  fullName: string;
  profileImage?: string;
  email: string;
  role: string;
}

export function ContactsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { isLoadingUsers, users: orgUsers, refreshUsers } = useNotebookContext();
  const { user: currentUser } = useUser();
  const { selectedOrg: organization } = useOrganizationContext();
  const { data: session } = useSession();
  const [{ isLoading: isInvitingUser }, inviteUserToOrg] = useInviteUserToOrg();

  const contacts = watch('contacts') || [];

  // Check if current user is admin
  const isCurrentUserAdmin = (() => {
    if (!session?.userId || !orgUsers?.users) return false;
    const currentUser = orgUsers.users.find((user) => user.id === session.userId.toString());
    return currentUser?.role === 'ADMIN';
  })();

  // Transform organization users to contact suggestions
  const orgMemberContacts: OrgMemberSuggestion[] =
    orgUsers?.users?.map((user: OrganizationMember) => ({
      id: user.id.toString(),
      fullName: user.name,
      profileImage: user.avatarUrl,
      email: user.email,
      role: user.role,
    })) || [];

  // Simple filtering function for organization users
  const handleSearchContacts = async (
    query: string
  ): Promise<SelectOption<OrgMemberSuggestion>[]> => {
    if (!query.trim()) {
      // Return all org users when no query
      return orgMemberContacts.map((contact) => ({
        value: contact.id,
        label: contact.fullName,
        data: contact,
      }));
    }

    // Simple case-insensitive filtering by name or email
    const filteredContacts = orgMemberContacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(query.toLowerCase()) ||
        contact.email.toLowerCase().includes(query.toLowerCase())
    );

    return filteredContacts.map((contact) => ({
      value: contact.id,
      label: contact.fullName,
      data: contact,
    }));
  };

  // Handle contact selection
  const handleContactSelect = (selectedOption: SelectOption<OrgMemberSuggestion> | null) => {
    if (selectedOption) {
      // Check if contact is already selected
      const isAlreadySelected = contacts.some(
        (contact: any) => contact.value === selectedOption.value
      );

      if (!isAlreadySelected) {
        const newContacts = [
          ...contacts,
          { ...selectedOption, image: selectedOption.data?.profileImage },
        ];
        setValue('contacts', newContacts, { shouldValidate: true });
      }
    }
  };

  // Handle contact removal
  const handleRemoveContact = (contactToRemove: SelectOption<OrgMemberSuggestion>) => {
    const newContacts = contacts.filter((contact: any) => contact.value !== contactToRemove.value);
    setValue('contacts', newContacts, { shouldValidate: true });
  };

  // Handle inviting a new user
  const handleInviteContact = async (
    query: string
  ): Promise<SelectOption<OrgMemberSuggestion> | null> => {
    if (!isValidEmail(query)) {
      toast.error('Please enter a valid email address');
      return null;
    }

    if (!organization) {
      toast.error('Organization not found');
      return null;
    }

    if (!isCurrentUserAdmin) {
      toast.error('Only admins can invite users');
      return null;
    }

    // Check if user is already a member
    const isAlreadyMember = orgMemberContacts.some(
      (contact) => contact.email.toLowerCase() === query.toLowerCase()
    );
    if (isAlreadyMember) {
      toast.error('This user is already a member of the organization');
      return null;
    }

    try {
      await inviteUserToOrg(organization.id, query);
      toast.success(`Invitation sent to ${query}`);

      // Refresh the organization users list to show the new invite
      await refreshUsers(true);

      // Return null since the invited user won't be immediately available for selection
      // They'll need to accept the invitation first
      return null;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite user');
      return null;
    }
  };

  // Render selected contact option
  const renderContactOption = (
    option: SelectOption<OrgMemberSuggestion>,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const contactData = option.data;

    return (
      <li
        key={option.value}
        className={`relative cursor-pointer select-none py-2 px-3 rounded-md text-sm list-none ${
          focus ? 'bg-gray-100' : 'text-gray-900'
        }`}
      >
        <AuthorInfo
          fullName={option.label}
          email={contactData?.email}
          image={contactData?.profileImage}
          size="sm"
        />
      </li>
    );
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Contacts</SectionHeader>

      {/* Contact Search */}
      <div className="mb-4">
        <AutocompleteSelect<OrgMemberSuggestion>
          value={null}
          onChange={handleContactSelect}
          onSearch={handleSearchContacts}
          placeholder={isLoadingUsers ? 'Loading contacts...' : 'Search for contacts...'}
          disabled={isLoadingUsers}
          error={getFieldErrorMessage(errors.contacts, 'Invalid contacts')}
          debounceMs={300}
          minSearchLength={1}
          renderOption={renderContactOption}
          allowCreatingNew={isCurrentUserAdmin}
          onCreateNew={handleInviteContact}
          createNewLabel="Invite: "
        />
      </div>

      {/* Selected Contacts Display */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Contacts:</p>
          <div className="space-y-2">
            {contacts.map((contact: any) => {
              const isCurrentUser = contact.data?.id === currentUser?.id?.toString();
              const orgMember = orgMemberContacts.find(
                (orgMember) => orgMember.id === contact.value.toString()
              );

              return (
                <div
                  key={contact.value}
                  className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <AuthorInfo
                    email={orgMember?.email}
                    fullName={contact.label || ''}
                    image={contact.image}
                    isCurrentUser={isCurrentUser}
                    size="md"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveContact(contact)}
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-gray-400 hover:text-red-600"
                    aria-label="Remove contact"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Add contacts who will be responsible for managing this RFP. These contacts will receive
        important updates about the RFP's progress.
      </p>
    </div>
  );
}
