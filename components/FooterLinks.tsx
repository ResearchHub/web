'use client';

import { useState, useEffect } from 'react';
import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { RadiatingDot } from '@/components/ui/RadiatingDot';

const CHANGELOG_VERSION = 'v1.0.1';
const CHANGELOG_STORAGE_KEY = `rh-changelog-seen-${CHANGELOG_VERSION}`;

export const FooterLinks: React.FC = () => {
  const { showUSD, toggleCurrency } = useCurrencyPreference();
  const [hasSeenChangelog, setHasSeenChangelog] = useState(true);

  useEffect(() => {
    const hasSeen = localStorage.getItem(CHANGELOG_STORAGE_KEY);
    setHasSeenChangelog(!!hasSeen);
  }, []);

  const handleChangelogClick = () => {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, 'true');
    setHasSeenChangelog(true);
  };

  return (
    <div className="px-4 py-6 border-t text-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <a
            href="https://x.com/researchhub"
            className="text-gray-500 hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
          </a>
          <a
            href="https://discord.com/invite/ZcCYgcnUp5"
            className="text-gray-500 hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/ResearchHub"
            className="text-gray-500 hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/researchhubtechnologies"
            className="text-gray-500 hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
          </a>
          {/* Currency Dropdown */}
          <select
            value={showUSD ? 'USD' : 'RSC'}
            onChange={() => toggleCurrency()}
            className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="RSC">RSC</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-gray-500">
        <a
          href="/changelog"
          className={`flex items-center gap-1 ${hasSeenChangelog ? 'hover:text-gray-700' : 'text-orange-500 hover:text-orange-600'}`}
          onClick={handleChangelogClick}
        >
          {!hasSeenChangelog && (
            <RadiatingDot
              size={12}
              dotSize={6}
              color="bg-orange-500"
              radiateColor="bg-orange-400"
              ringColor="border-orange-200"
            />
          )}
          Changelog
        </a>
        <a href="https://www.researchhub.com/about/tos" className="hover:text-gray-700">
          Terms
        </a>
        <a href="https://www.researchhub.com/about/privacy" className="hover:text-gray-700">
          Privacy
        </a>
        <a
          href="https://github.com/ResearchHub/issues/issues/new/choose"
          className="hover:text-gray-700"
        >
          Issues
        </a>
        <a href="https://docs.researchhub.com/" className="hover:text-gray-700">
          Docs
        </a>
        <a
          href="https://airtable.com/appuhMJaf1kb3ic8e/pagYeh6cB9sgiTIgx/form"
          className="hover:text-gray-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          Support
        </a>
        <a href="https://researchhub.foundation/" className="hover:text-gray-700">
          Foundation
        </a>
        <a href="https://www.researchhub.com/about" className="hover:text-gray-700">
          About
        </a>
      </div>
    </div>
  );
};
