'use client';

import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const FooterLinks: React.FC = () => (
  <div className="px-4 py-6 border-t text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
      </a>
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
      </a>
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
      </a>
      <a href="#" className="text-gray-500 hover:text-gray-700">
        <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
      </a>
    </div>
    <div className="flex flex-wrap gap-3 text-gray-500">
      <a href="#" className="hover:text-gray-700">
        Terms
      </a>
      <a href="#" className="hover:text-gray-700">
        Privacy
      </a>
      <a href="#" className="hover:text-gray-700">
        Issues
      </a>
      <a href="#" className="hover:text-gray-700">
        Docs
      </a>
      <a href="#" className="hover:text-gray-700">
        Community
      </a>
      <a href="#" className="hover:text-gray-700">
        About
      </a>
    </div>
  </div>
);
