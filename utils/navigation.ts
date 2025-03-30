import { useRouter } from 'next/navigation';

/**
 * Opens an author profile using the appropriate routing mechanism
 * @param authorId The ID of the author to navigate to
 * @param newTab Whether to open in a new tab (defaults to true)
 */
export const navigateToAuthorProfile = (authorId: number | string | undefined, newTab = true) => {
  if (!authorId) return;

  const isProduction = process.env.NODE_ENV === 'production';
  const url = isProduction ? `https://researchhub.com/author/${authorId}` : `/author/${authorId}`;

  if (newTab || isProduction) {
    // For production or when explicitly requested, open in a new tab
    window.open(url, '_blank');
  } else {
    // For development, use router
    // Note: This doesn't work directly as a util function
    // The component should handle this case with useRouter
    window.location.href = url;
  }
};
