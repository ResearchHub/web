import {
  faCreativeCommons,
  faCreativeCommonsBy,
  faCreativeCommonsNc,
  faCreativeCommonsNd,
  faCreativeCommonsSa,
  faCreativeCommonsZero,
} from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface LicenseDescription {
  title: string;
  shortTitle: string;
  allows: string[];
  disallows: string[];
}

export interface LicenseInfo {
  icons: IconDefinition[];
  label: string | null;
  url: string | null;
  description: LicenseDescription | null;
}

const LICENSE_URLS: Record<string, string> = {
  'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-nc': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-nd': 'https://creativecommons.org/licenses/by-nd/4.0/',
  'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-nc-sa': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'cc-by-nc-nd': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  cc0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-zero': 'https://creativecommons.org/publicdomain/zero/1.0/',
};

const CC0_DESCRIPTION: LicenseDescription = {
  title: 'Creative Commons Zero (Public Domain Dedication)',
  shortTitle: 'CC0 1.0',
  allows: ['Share', 'Adapt', 'Commercial use', 'No attribution'],
  disallows: [],
};

const LICENSE_DESCRIPTIONS: Record<string, LicenseDescription> = {
  'cc-by': {
    title: 'Creative Commons Attribution 4.0 International License',
    shortTitle: 'CC BY 4.0',
    allows: ['Share', 'Adapt', 'Commercial use'],
    disallows: [],
  },
  'cc-by-nc': {
    title: 'Creative Commons Attribution-Non-Commercial 4.0 International License',
    shortTitle: 'CC BY-NC 4.0',
    allows: ['Share', 'Adapt'],
    disallows: ['Commercial use'],
  },
  'cc-by-nd': {
    title: 'Creative Commons Attribution-No Derivatives 4.0 International License',
    shortTitle: 'CC BY-ND 4.0',
    allows: ['Share', 'Commercial use'],
    disallows: ['Adapt or remix'],
  },
  'cc-by-sa': {
    title: 'Creative Commons Attribution-Share Alike 4.0 International License',
    shortTitle: 'CC BY-SA 4.0',
    allows: ['Share', 'Adapt', 'Commercial use'],
    disallows: [],
  },
  'cc-by-nc-sa': {
    title: 'Creative Commons Attribution-Non-Commercial-Share Alike 4.0 International License',
    shortTitle: 'CC BY-NC-SA 4.0',
    allows: ['Share', 'Adapt'],
    disallows: ['Commercial use'],
  },
  'cc-by-nc-nd': {
    title: 'Creative Commons Attribution-Non-Commercial-No Derivatives 4.0 International License',
    shortTitle: 'CC BY-NC-ND 4.0',
    allows: ['Share'],
    disallows: ['Commercial use', 'Adapt or remix'],
  },
  cc0: CC0_DESCRIPTION,
  'cc-zero': CC0_DESCRIPTION,
};

export const parseLicense = (license?: string): LicenseInfo => {
  if (!license) {
    return { icons: [], label: null, url: null, description: null };
  }

  const normalizedLicense = license.toLowerCase().trim();

  if (normalizedLicense === 'cc0' || normalizedLicense === 'cc-zero') {
    return {
      icons: [faCreativeCommons, faCreativeCommonsZero],
      label: 'CC-ZERO',
      url: LICENSE_URLS['cc0'],
      description: LICENSE_DESCRIPTIONS['cc0'],
    };
  }

  const icons: IconDefinition[] = [faCreativeCommons];
  const labelParts: string[] = [];

  if (normalizedLicense.includes('by')) {
    icons.push(faCreativeCommonsBy);
    labelParts.push('BY');
  }

  if (normalizedLicense.includes('nc')) {
    icons.push(faCreativeCommonsNc);
    labelParts.push('NC');
  }

  if (normalizedLicense.includes('nd')) {
    icons.push(faCreativeCommonsNd);
    labelParts.push('ND');
  }

  if (normalizedLicense.includes('sa')) {
    icons.push(faCreativeCommonsSa);
    labelParts.push('SA');
  }

  const fullLabel = labelParts.length > 0 ? `CC-${labelParts.join('-')}` : null;

  const url = LICENSE_URLS[normalizedLicense] || null;
  const description = LICENSE_DESCRIPTIONS[normalizedLicense] || null;

  return { icons, label: fullLabel, url, description };
};
