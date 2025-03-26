import type { Organization } from '@/types/organization';
import { getSelectedOrganization, findOrganizationById } from './organizationStorage';

/**
 * Selects an organization based on a priority order:
 * 1. Organization matching the target slug (if provided)
 * 2. Organization from localStorage
 * 3. Organization where user is an admin
 * 4. First organization in the list
 *
 * @param organizations List of organizations to select from
 * @param targetSlug Optional target slug to match
 * @returns The selected organization or undefined if no organizations are available
 */
export function selectOrganization(
  organizations: Organization[],
  targetSlug?: string | null
): Organization | undefined {
  if (!organizations || organizations.length === 0) {
    return undefined;
  }

  let selectedOrg: Organization | undefined;

  // Priority 1 (highest): Try to match org from URL
  if (targetSlug) {
    selectedOrg = organizations.find((org) => org.slug === targetSlug);
  }

  // Priority 2: Try to find org from localStorage
  if (!selectedOrg) {
    const storedOrg = getSelectedOrganization();
    selectedOrg = findOrganizationById(organizations, storedOrg);
  }

  // Priority 3: Find an org where user is admin
  if (!selectedOrg) {
    selectedOrg = organizations.find((org) => org.userPermission?.accessType === 'ADMIN');
  }

  // Priority 4 (lowest): Default to first org
  if (!selectedOrg && organizations.length > 0) {
    selectedOrg = organizations[0];
  }

  return selectedOrg;
}
