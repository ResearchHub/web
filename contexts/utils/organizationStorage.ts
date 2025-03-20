import type { Organization } from '@/types/organization';

const STORAGE_KEY = 'selected_organization';

interface StoredOrganization {
  id: number;
  slug: string;
}

/**
 * Saves the selected organization to localStorage
 * @param org - The organization object or its ID and slug
 */
export const saveSelectedOrganization = (org: Organization | StoredOrganization): void => {
  if (typeof window === 'undefined') return;

  try {
    const dataToStore: StoredOrganization = {
      id: org.id,
      slug: org.slug,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error saving selected organization to localStorage:', error);
  }
};

/**
 * Retrieves the selected organization from localStorage
 * @returns The stored organization data, or null if not found
 */
export const getSelectedOrganization = (): StoredOrganization | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;

    return JSON.parse(storedData) as StoredOrganization;
  } catch (error) {
    console.error('Error reading selected organization from localStorage:', error);
    return null;
  }
};

/**
 * Finds an organization from the list by ID
 * @param organizations - List of available organizations
 * @param storedOrg - The stored organization data
 * @returns The matching organization or undefined if not found
 */
export const findOrganizationById = (
  organizations: Organization[],
  storedOrg: StoredOrganization | null
): Organization | undefined => {
  if (!storedOrg) return undefined;

  // First try to find by ID
  const orgById = organizations.find((org) => org.id === storedOrg.id);
  if (orgById) return orgById;

  // If not found by ID, try by slug as fallback
  return organizations.find((org) => org.slug === storedOrg.slug);
};
