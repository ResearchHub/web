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

// Create a type for organization member as author suggestion
interface OrgMemberSuggestion {
  id: string;
  fullName: string;
  profileImage?: string;
  email: string;
  role: string;
}

export function AuthorsSection() {
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

  const authors = watch('authors') || [];

  // Check if current user is admin
  const isCurrentUserAdmin = (() => {
    if (!session?.userId || !orgUsers?.users) return false;
    const currentUser = orgUsers.users.find((user) => user.id === session.userId.toString());
    return currentUser?.role === 'ADMIN';
  })();

  // Transform organization users to author suggestions
  const orgMemberAuthors: OrgMemberSuggestion[] =
    orgUsers?.users?.map((user: OrganizationMember) => ({
      id: user.authorId.toString(),
      fullName: user.name,
      profileImage: user.avatarUrl,
      email: user.email,
      role: user.role,
    })) || [];

  // Simple filtering function for organization users
  const handleSearchAuthors = async (
    query: string
  ): Promise<SelectOption<OrgMemberSuggestion>[]> => {
    if (!query.trim()) {
      // Return all org users when no query
      return orgMemberAuthors.map((author) => ({
        value: author.id,
        label: author.fullName,
        data: author,
      }));
    }

    // Simple case-insensitive filtering by name or email
    const filteredAuthors = orgMemberAuthors.filter(
      (author) =>
        author.fullName.toLowerCase().includes(query.toLowerCase()) ||
        author.email.toLowerCase().includes(query.toLowerCase())
    );

    return filteredAuthors.map((author) => ({
      value: author.id,
      label: author.fullName,
      data: author,
    }));
  };

  // Handle author selection
  const handleAuthorSelect = (selectedOption: SelectOption<OrgMemberSuggestion> | null) => {
    if (selectedOption) {
      // Check if author is already selected
      const isAlreadySelected = authors.some(
        (author: any) => author.value === selectedOption.value
      );

      if (!isAlreadySelected) {
        const newAuthors = [
          ...authors,
          { ...selectedOption, image: selectedOption.data?.profileImage },
        ];
        setValue('authors', newAuthors, { shouldValidate: true });
      }
    }
  };

  // Handle author removal
  const handleRemoveAuthor = (authorToRemove: SelectOption<OrgMemberSuggestion>) => {
    const newAuthors = authors.filter((author: any) => author.value !== authorToRemove.value);
    setValue('authors', newAuthors, { shouldValidate: true });
  };

  // Handle inviting a new user
  const handleInviteAuthor = async (
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
    const isAlreadyMember = orgMemberAuthors.some(
      (author) => author.email.toLowerCase() === query.toLowerCase()
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

  // Render selected author option
  const renderAuthorOption = (
    option: SelectOption<OrgMemberSuggestion>,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const authorData = option.data;

    return (
      <li
        key={option.value}
        className={`relative cursor-pointer select-none py-2 px-3 rounded-md text-sm list-none ${
          focus ? 'bg-gray-100' : 'text-gray-900'
        }`}
      >
        <AuthorInfo
          fullName={option.label}
          email={authorData?.email}
          image={authorData?.profileImage}
          size="sm"
        />
      </li>
    );
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Authors</SectionHeader>

      {/* Author Search */}
      <div className="mb-4">
        <AutocompleteSelect<OrgMemberSuggestion>
          value={null}
          onChange={handleAuthorSelect}
          onSearch={handleSearchAuthors}
          placeholder={isLoadingUsers ? 'Loading authors...' : 'Search for authors...'}
          disabled={isLoadingUsers}
          error={getFieldErrorMessage(errors.authors, 'Invalid authors')}
          debounceMs={300}
          minSearchLength={1}
          renderOption={renderAuthorOption}
          allowCreatingNew={isCurrentUserAdmin}
          onCreateNew={handleInviteAuthor}
          createNewLabel="Invite: "
        />
      </div>

      {/* Selected Authors Display */}
      {authors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Authors:</p>
          <div className="space-y-2">
            {authors.map((author: any) => {
              const isCurrentUser =
                author.value.toString() === currentUser?.authorProfile?.id?.toString();
              const orgMember = orgMemberAuthors.find(
                (orgMember) => orgMember.id === author.value.toString()
              );

              return (
                <div
                  key={author.value}
                  className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <AuthorInfo
                    email={orgMember?.email}
                    fullName={author.label || ''}
                    image={author.image}
                    isCurrentUser={isCurrentUser}
                    size="md"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveAuthor(author)}
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-gray-400 hover:text-red-600"
                    aria-label="Remove author"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
