import { redirect } from 'next/navigation';
import { Work } from '@/types/work';
import { generateSlug } from '@/utils/url';
import { ExperimentVariant, isExperimentEnabledServer } from '@/utils/experiment';

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
 * Handles redirection for question posts
 * @param work The work object to check for question type
 * @param id The post ID
 * @param slug The post slug
 * @param tab Optional tab to append to the URL (e.g., 'conversation', 'bounties')
 */
export function handleQuestionRedirect(work: Work, id: string, slug: string, tab?: string) {
  if (work.postType === 'QUESTION') {
    const basePath = `/question/${id}/${slug}`;
    const redirectPath = tab ? `${basePath}/${tab}` : basePath;
    redirect(redirectPath);
  }
}

/**
 * Handles redirection for grant posts
 * @param work The work object to check for grant type
 * @param id The post ID
 * @param slug The post slug
 */
export function handleGrantRedirect(work: Work, id: string, slug: string) {
  // Grants are represented as contentType 'funding_request' or postType 'GRANT'
  if (work.contentType === 'funding_request' || work.postType === 'GRANT') {
    redirect(`/grant/${id}/${slug}`);
  }
}

/**
 * Handles all post-related redirects (fundraise and question)
 * @param work The work object to check for redirects
 * @param id The post ID
 * @param slug The post slug
 * @param tab Optional tab to append to the URL for question redirects
 */
export function handlePostRedirect(work: Work, id: string, slug: string, tab?: string) {
  // Check for question redirect first
  handleQuestionRedirect(work, id, slug, tab);

  // Then check for fundraise redirect
  handleFundraiseRedirect(work, id, slug);

  // Finally check for grant redirect
  handleGrantRedirect(work, id, slug);
}

/**
 * Handles redirection when slug is missing from the URL
 * @param work The work object to get the slug from
 * @param id The post ID
 * @param currentPath The current path (e.g., 'post', 'question', 'fund', 'paper', 'grant')
 */
export function handleMissingSlugRedirect(work: Work, id: string, currentPath: string = 'post') {
  // Use existing slug if available, otherwise try to generate from title
  let slug = work.slug;

  if (!slug) {
    if (work.title) {
      slug = generateSlug(work.title);
    } else {
      // If no title exists, use 'undefined' to avoid infinite redirection
      slug = 'undefined';
    }
  }

  // Construct the redirect URL
  const redirectPath = `/${currentPath}/${id}/${slug}`;
  redirect(redirectPath);
}

/**
 * Handles redirection to trending page if user is authorized
 * @param isUserLoggedIn Whether the user is logged in
 * @param searchParams Optional search parameters to preserve in the redirect
 */
export function handleTrendingRedirect(
  isUserLoggedIn: boolean,
  searchParams?: URLSearchParams,
  homepageExperimentVariant?: ExperimentVariant | null
) {
  // Redirect if user is logged in OR if homepage experiment is enabled
  const isHPExperimentEnabled = isExperimentEnabledServer(homepageExperimentVariant);

  if (!isUserLoggedIn && isHPExperimentEnabled) {
    let redirectUrl = '/popular';

    // Preserve search parameters if provided
    if (searchParams && searchParams.toString()) {
      redirectUrl += `?${searchParams.toString()}`;
    }

    redirect(redirectUrl);
  }

  if (isUserLoggedIn) {
    let redirectUrl = '/for-you';

    // Preserve search parameters if provided
    if (searchParams && searchParams.toString()) {
      redirectUrl += `?${searchParams.toString()}`;
    }

    redirect(redirectUrl);
  }
}
