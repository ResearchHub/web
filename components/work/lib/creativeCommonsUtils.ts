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
  type: 'cc-icons' | 'text-with-link' | 'text-only';
  icons: IconDefinition[];
  label: string | null;
  url: string | null;
  description: LicenseDescription | null;
}

const CC0_VARIANTS = new Set(['cc0', 'cc-zero', 'cc0-1.0', 'cc0-ng']);

const LICENSE_URLS: Record<string, string> = {
  // CC0 variants
  cc0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-zero': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc0-ng': 'https://creativecommons.org/publicdomain/zero/1.0/',
  // CC BY variants
  'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'cc-by-4.0': 'https://creativecommons.org/licenses/by/4.0/',
  // CC BY-NC variants
  'cc-by-nc': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'cc-by-nc-4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
  // CC BY-ND variants
  'cc-by-nd': 'https://creativecommons.org/licenses/by-nd/4.0/',
  // CC BY-SA variants
  'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'cc-by-sa-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  // CC BY-NC-SA variants
  'cc-by-nc-sa': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'cc-by-nc-sa-3.0': 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
  'cc-by-nc-sa-4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  // CC BY-NC-ND variants
  'cc-by-nc-nd': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  'cc-by-nc-nd-4.0': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  // Non-CC licenses with links
  'arxiv-nonexclusive-distrib-1.0': 'https://arxiv.org/licenses/nonexclusive-distrib/1.0/',
  'arxiv.org perpetual, non-exclusive license':
    'https://arxiv.org/licenses/nonexclusive-distrib/1.0/',
  gpl: 'https://www.gnu.org/licenses/gpl-3.0.html',
  'gpl-v3': 'https://www.gnu.org/licenses/gpl-3.0.html',
  mit: 'https://opensource.org/licenses/MIT',
  pd: 'https://creativecommons.org/publicdomain/mark/1.0/',
  'public-domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
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
  'cc-by-3.0': {
    title: 'Creative Commons Attribution 3.0 International License',
    shortTitle: 'CC BY 3.0',
    allows: ['Share', 'Adapt', 'Commercial use'],
    disallows: [],
  },
  'cc-by-4.0': {
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
  'cc-by-nc-4.0': {
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
  'cc-by-sa-4.0': {
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
  'cc-by-nc-sa-3.0': {
    title: 'Creative Commons Attribution-Non-Commercial-Share Alike 3.0 International License',
    shortTitle: 'CC BY-NC-SA 3.0',
    allows: ['Share', 'Adapt'],
    disallows: ['Commercial use'],
  },
  'cc-by-nc-sa-4.0': {
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
  'cc-by-nc-nd-4.0': {
    title: 'Creative Commons Attribution-Non-Commercial-No Derivatives 4.0 International License',
    shortTitle: 'CC BY-NC-ND 4.0',
    allows: ['Share'],
    disallows: ['Commercial use', 'Adapt or remix'],
  },
  cc0: CC0_DESCRIPTION,
  'cc-zero': CC0_DESCRIPTION,
  'cc0-1.0': CC0_DESCRIPTION,
  'cc0-ng': CC0_DESCRIPTION,
};

// Helper function to get display label for non-CC licenses
const getNonCCLicenseLabel = (license: string): string => {
  const normalized = license.toLowerCase().trim();
  const labelMap: Record<string, string> = {
    'arxiv-nonexclusive-distrib-1.0': 'arXiv License 1.0',
    'arxiv.org perpetual, non-exclusive license': 'arXiv License',
    gpl: 'GPL v3',
    'gpl-v3': 'GPL v3',
    mit: 'MIT License',
    pd: 'Public Domain',
    'public-domain': 'Public Domain',
  };
  return labelMap[normalized] || license;
};

// Helper to build CC license icons and label from normalized license string
const buildCCLicenseInfo = (
  normalizedLicense: string
): { icons: IconDefinition[]; label: string | null } => {
  const icons: IconDefinition[] = [faCreativeCommons];
  const labelParts: string[] = [];

  const componentMap: Array<{ key: string; icon: IconDefinition; label: string }> = [
    { key: 'by', icon: faCreativeCommonsBy, label: 'BY' },
    { key: 'nc', icon: faCreativeCommonsNc, label: 'NC' },
    { key: 'nd', icon: faCreativeCommonsNd, label: 'ND' },
    { key: 'sa', icon: faCreativeCommonsSa, label: 'SA' },
  ];

  for (const { key, icon, label } of componentMap) {
    if (normalizedLicense.includes(key)) {
      icons.push(icon);
      labelParts.push(label);
    }
  }

  return {
    icons,
    label: labelParts.length > 0 ? `CC-${labelParts.join('-')}` : null,
  };
};

const DEFAULT_LICENSE_INFO: LicenseInfo = {
  type: 'text-only',
  icons: [],
  label: null,
  url: null,
  description: null,
};

export const parseLicense = (license?: string): LicenseInfo => {
  if (!license) {
    return DEFAULT_LICENSE_INFO;
  }

  const normalizedLicense = license.toLowerCase().trim();

  // Handle CC0 variants
  if (CC0_VARIANTS.has(normalizedLicense)) {
    return {
      type: 'cc-icons',
      icons: [faCreativeCommons, faCreativeCommonsZero],
      label: 'CC-ZERO',
      url: LICENSE_URLS[normalizedLicense] || LICENSE_URLS['cc0'],
      description: LICENSE_DESCRIPTIONS[normalizedLicense] || LICENSE_DESCRIPTIONS['cc0'],
    };
  }

  // Handle CC licenses (with icons)
  if (normalizedLicense.startsWith('cc-')) {
    const { icons, label } = buildCCLicenseInfo(normalizedLicense);
    const url = LICENSE_URLS[normalizedLicense] || null;

    if (icons.length > 1 && url) {
      return {
        type: 'cc-icons',
        icons,
        label,
        url,
        description: LICENSE_DESCRIPTIONS[normalizedLicense] || null,
      };
    }
  }

  // Handle non-CC licenses with links (plain text style)
  const nonCCUrl = LICENSE_URLS[normalizedLicense];
  if (nonCCUrl) {
    return {
      type: 'text-with-link',
      icons: [],
      label: getNonCCLicenseLabel(license),
      url: nonCCUrl,
      description: null,
    };
  }

  // Default: unknown licenses, render as plain text
  return {
    type: 'text-only',
    icons: [],
    label: license,
    url: null,
    description: null,
  };
};
