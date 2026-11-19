'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';

//
// FIXME: Remove this file once the legacy auth cookie is no longer valid (14 days after deploy)
//
// The retired cross-app auth sharing kept the API token in a script-readable
// cookie on the parent domain, where every subdomain could read it. Each write
// set a 14-day expiry, so this can be deleted two weeks after deploy.
const LEGACY_AUTH_COOKIE = (() => {
  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case 'production':
      return { name: 'prod.researchhub.auth.token', domain: '.researchhub.com' };
    case 'preview':
    case 'development':
      return { name: 'stg.researchhub.auth.token', domain: '.staging.researchhub.com' };
    default:
      return { name: 'local.researchhub.auth.token', domain: 'localhost' };
  }
})();

export function LegacyAuthCookieCleanup() {
  useEffect(() => {
    Cookies.remove(LEGACY_AUTH_COOKIE.name, { domain: LEGACY_AUTH_COOKIE.domain, path: '/' });
  }, []);

  return null;
}
