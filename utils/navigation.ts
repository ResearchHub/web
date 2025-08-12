import { redirect } from 'next/navigation';
import { Work } from '@/types/work';
// import { ExperimentVariant, isExperimentEnabledServer } from '@/utils/experiment'; // Removed - experiment killed

/**
 * Opens an author profile using the appropriate routing mechanism
 * @param authorId The ID of the author to navigate to
 * @param newTab Whether to open in a new tab (defaults to true)
 */
export const navigateToAuthorProfile = (authorId: number | string | undefined, newTab = false) => {
  if (!authorId) return;

  const url = `/author/${authorId}`;

  if (newTab) {
    window.open(url, '_blank');
  } else {
    // For development, use router
    // Note: This doesn't work directly as a util function
    // The component should handle this case with useRouter
    window.location.href = url;
  }
};

/**
 * Handles redirection for fundraise posts
 * @param work The work object to check for fundraise
 * @param id The post ID
 * @param slug The post slug
 */
export function handleFundraiseRedirect(work: Work, id: string, slug: string) {
  if (work.note?.post?.fundraise) {
    redirect(`/fund/${id}/${slug}`);
  }
}

/**
 * Handles redirection to trending page if user is authorized
 * @param isUserLoggedIn Whether the user is logged in
 * @param homepageExperimentVariant @deprecated No longer used - experiment killed
 * @param searchParams Optional search parameters to preserve in the redirect
 */
export function handleTrendingRedirect(
  isUserLoggedIn: boolean,
  homepageExperimentVariant?: any, // @deprecated - kept for backward compatibility
  searchParams?: URLSearchParams
) {
  // Redirect if user is logged in (experiment logic removed)
  if (isUserLoggedIn) {
    let redirectUrl = '/trending';

    // Preserve search parameters if provided
    if (searchParams && searchParams.toString()) {
      redirectUrl += `?${searchParams.toString()}`;
    }

    redirect(redirectUrl);
  }
}
