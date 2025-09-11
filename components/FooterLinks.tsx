'use client';

import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const FooterLinks: React.FC = () => {
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
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-gray-500">
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
