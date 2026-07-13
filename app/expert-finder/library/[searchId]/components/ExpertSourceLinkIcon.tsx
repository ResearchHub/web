'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faLinkedin, faOrcid } from '@fortawesome/free-brands-svg-icons';
import { ExternalLink, GraduationCap } from 'lucide-react';
import type { ExpertSourceLink } from '@/types/expertFinder';

export type ExpertSourceIconType = 'orcid' | 'edu' | 'linkedin' | 'google-scholar' | 'generic';

const ICON_CLASS = 'h-4 w-4 shrink-0';

export function getExpertSourceIconType(url: string, text?: string): ExpertSourceIconType {
  const combined = `${url} ${text ?? ''}`.toLowerCase();

  let hostname = '';
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'generic';
  }

  if (hostname.includes('orcid.org') || combined.includes('orcid')) {
    return 'orcid';
  }

  if (hostname.includes('linkedin.com') || combined.includes('linkedin')) {
    return 'linkedin';
  }

  if (hostname.includes('scholar.google') || combined.includes('google scholar')) {
    return 'google-scholar';
  }

  if (hostname.endsWith('.edu') || hostname.includes('.edu.')) {
    return 'edu';
  }

  return 'generic';
}

export function ExpertSourceLinkIcon({ url, text }: Pick<ExpertSourceLink, 'url' | 'text'>) {
  const type = getExpertSourceIconType(url, text);

  switch (type) {
    case 'orcid':
      return (
        <FontAwesomeIcon icon={faOrcid} className={`${ICON_CLASS} text-orcid-500`} aria-hidden />
      );
    case 'edu':
      return <GraduationCap className={`${ICON_CLASS} text-blue-600`} aria-hidden />;
    case 'linkedin':
      return (
        <FontAwesomeIcon icon={faLinkedin} className={`${ICON_CLASS} text-[#0077B5]`} aria-hidden />
      );
    case 'google-scholar':
      return (
        <FontAwesomeIcon icon={faGoogle} className={`${ICON_CLASS} text-[#4285F4]`} aria-hidden />
      );
    default:
      return <ExternalLink className={`${ICON_CLASS} text-primary-600`} aria-hidden />;
  }
}
