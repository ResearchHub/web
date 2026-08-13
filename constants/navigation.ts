/** Classic home feed tab paths (excludes `/` and `/feed` aliases). */
export const CLASSIC_FEED_PATHS = ['/popular', '/for-you', '/following', '/latest'] as const;

export type ClassicFeedPath = (typeof CLASSIC_FEED_PATHS)[number];

export function isClassicHomeFeedPath(pathname: string): boolean {
  return (CLASSIC_FEED_PATHS as readonly string[]).includes(pathname);
}

export function isNavPathActive({
  path,
  currentPath,
  isHome,
}: {
  path: string;
  currentPath: string;
  isHome?: boolean;
}): boolean {
  if (isHome) {
    return isClassicHomeFeedPath(currentPath) || currentPath === '/';
  }

  if (path === '/fund') {
    return (
      currentPath === '/fund' ||
      currentPath.startsWith('/fund/proposals') ||
      (currentPath.startsWith('/fund/') && !currentPath.startsWith('/fund/dashboard'))
    );
  }

  if (path === '/earn') {
    return currentPath.startsWith('/earn');
  }

  if (path === '/my-funding') {
    return (
      currentPath === '/my-funding' ||
      currentPath === '/fund/dashboard' ||
      currentPath.startsWith('/fund/dashboard/')
    );
  }

  if (path === '/notebook') {
    return currentPath.startsWith('/notebook');
  }

  if (path === '/journal') {
    return currentPath.startsWith('/journal');
  }

  if (path === '/endowment') {
    return currentPath.startsWith('/endowment');
  }

  if (path === '/lists') {
    return currentPath === '/lists' || currentPath.startsWith('/list/');
  }

  return path === currentPath;
}
