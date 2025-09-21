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

// Create a type for organization member as contact suggestion
interface OrgMemberContactSuggestion {
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
  const orgMemberContacts: OrgMemberContactSuggestion[] =
    orgUsers?.users?.map((user: OrganizationMember) => ({
      id: user.id,
      fullName: user.name,
      profileImage: user.avatarUrl,
      email: user.email,
      role: user.role,
    })) || [];

  // Simple filtering function for organization users
  const handleSearchContacts = async (
    query: string
  ): Promise<SelectOption<OrgMemberContactSuggestion>[]> => {
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
  const handleContactSelect = (selectedOption: SelectOption<OrgMemberContactSuggestion> | null) => {
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
  const handleRemoveContact = (contactToRemove: SelectOption<OrgMemberContactSuggestion>) => {
    const newContacts = contacts.filter((contact: any) => contact.value !== contactToRemove.value);
    setValue('contacts', newContacts, { shouldValidate: true });
  };

  // Handle inviting a new user
  const handleInviteContact = async (
    query: string
  ): Promise<SelectOption<OrgMemberContactSuggestion> | null> => {
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
    option: SelectOption<OrgMemberContactSuggestion>,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const contactData = option.data;

    return (
      <li
        className={`relative cursor-pointer select-none py-2 px-3 rounded-md text-sm list-none ${
          focus ? 'bg-gray-100' : 'text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3 max-w-full truncate">
          <div className="flex-shrink-0">
            {contactData?.profileImage ? (
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img
                  src={contactData.profileImage}
                  alt={contactData.fullName || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</p>
            <p className="text-xs text-gray-600 truncate">{contactData?.email}</p>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Contacts</SectionHeader>

      {/* Contact Search */}
      <div className="mb-4">
        <AutocompleteSelect<OrgMemberContactSuggestion>
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
            {contacts.map((contact: any) => (
              <div
                key={contact.value}
                className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 max-w-full truncate">
                  <div className="flex-shrink-0">
                    {contact.image ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={contact.image}
                          alt={contact.label || ''}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contact.label}
                      {contact.data?.id === currentUser?.id?.toString() && (
                        <span className="text-gray-500 ml-1">(you)</span>
                      )}
                    </p>
                    {contact.data?.email && (
                      <p className="text-xs text-gray-600 truncate">{contact.data.email}</p>
                    )}
                  </div>
                </div>
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
            ))}
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
