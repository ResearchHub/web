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

const CC_MODIFIERS = {
  by: {
    icon: faCreativeCommonsBy,
    titlePart: 'Attribution',
    allows: ['Share', 'Adapt', 'Commercial use'],
    disallows: [],
  },
  nc: {
    icon: faCreativeCommonsNc,
    titlePart: 'Non-Commercial',
    allows: [],
    disallows: ['Commercial use'],
  },
  nd: {
    icon: faCreativeCommonsNd,
    titlePart: 'No Derivatives',
    allows: [],
    disallows: ['Adapt or remix'],
  },
  sa: {
    icon: faCreativeCommonsSa,
    titlePart: 'Share Alike',
    allows: [],
    disallows: [],
  },
} as const;

type CCModifier = keyof typeof CC_MODIFIERS;

const NON_CC_LICENSES: Record<string, { label: string; url: string }> = {
  arxiv: {
    label: 'arXiv License',
    url: 'https://arxiv.org/licenses/nonexclusive-distrib/1.0/',
  },
  mit: {
    label: 'MIT License',
    url: 'https://opensource.org/licenses/MIT',
  },
  gpl: {
    label: 'GPL v3',
    url: 'https://www.gnu.org/licenses/gpl-3.0.html',
  },
  'public-domain': {
    label: 'Public Domain',
    url: 'https://creativecommons.org/publicdomain/mark/1.0/',
  },
};

interface ParsedCC {
  modifiers: CCModifier[];
  version: string;
}

const parseCCLicense = (normalized: string): ParsedCC | null => {
  if (/^cc-?0/.test(normalized) || normalized === 'cc-zero') {
    return { modifiers: [], version: '1.0' };
  }

  const ccMatch = /^cc-(.+?)(?:-(\d+\.\d+))?$/.exec(normalized);
  if (!ccMatch) return null;

  const modifierStr = ccMatch[1];
  const version = ccMatch[2] || '4.0';

  const modifierParts = modifierStr.split('-');
  const validModifiers: CCModifier[] = [];

  for (const part of modifierParts) {
    if (part in CC_MODIFIERS) {
      validModifiers.push(part as CCModifier);
    } else {
      return null;
    }
  }

  if (validModifiers.length === 0) return null;

  return { modifiers: validModifiers, version };
};

const buildCCLicenseInfo = (parsed: ParsedCC): LicenseInfo => {
  const { modifiers, version } = parsed;

  if (modifiers.length === 0) {
    return {
      type: 'cc-icons',
      icons: [faCreativeCommons, faCreativeCommonsZero],
      label: 'CC0',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      description: {
        title: 'Creative Commons Zero (Public Domain Dedication)',
        shortTitle: 'CC0 1.0',
        allows: ['Share', 'Adapt', 'Commercial use', 'No attribution required'],
        disallows: [],
      },
    };
  }

  const icons: IconDefinition[] = [faCreativeCommons];
  modifiers.forEach((mod) => icons.push(CC_MODIFIERS[mod].icon));

  const label = `CC-${modifiers.map((m) => m.toUpperCase()).join('-')}`;

  const urlPath = modifiers.join('-');
  const url = `https://creativecommons.org/licenses/${urlPath}/${version}/`;

  const titleParts = modifiers.map((m) => CC_MODIFIERS[m].titlePart);
  const title = `Creative Commons ${titleParts.join('-')} ${version} International License`;
  const shortTitle = `${label} ${version}`;

  const allows = new Set<string>();
  const disallows = new Set<string>();

  modifiers.forEach((mod) => {
    CC_MODIFIERS[mod].allows.forEach((a) => allows.add(a));
    CC_MODIFIERS[mod].disallows.forEach((d) => disallows.add(d));
  });

  disallows.forEach((d) => {
    if (d === 'Commercial use') allows.delete('Commercial use');
    if (d === 'Adapt or remix') allows.delete('Adapt');
  });

  return {
    type: 'cc-icons',
    icons,
    label,
    url,
    description: {
      title,
      shortTitle,
      allows: Array.from(allows),
      disallows: Array.from(disallows),
    },
  };
};

const resolveNonCCLicense = (normalized: string): string | null => {
  if (normalized in NON_CC_LICENSES) return normalized;
  if (normalized.includes('arxiv')) return 'arxiv';
  if (normalized.startsWith('gpl')) return 'gpl';
  if (normalized === 'pd') return 'public-domain';
  return null;
};

export const parseLicense = (license?: string): LicenseInfo => {
  if (!license) {
    return { type: 'text-only', icons: [], label: null, url: null, description: null };
  }

  const normalized = license.toLowerCase().trim();

  const ccParsed = parseCCLicense(normalized);
  if (ccParsed) {
    return buildCCLicenseInfo(ccParsed);
  }

  const nonCCKey = resolveNonCCLicense(normalized);
  if (nonCCKey) {
    const { label, url } = NON_CC_LICENSES[nonCCKey];
    return { type: 'text-with-link', icons: [], label, url, description: null };
  }

  return { type: 'text-only', icons: [], label: license, url: null, description: null };
};
