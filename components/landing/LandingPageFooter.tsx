'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { ContactModal } from '@/components/modals/ContactModal';
import { colors } from '@/app/styles/colors';

export function LandingPageFooter() {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const platformLinks = [
    { label: 'Home', href: '/trending' },
    { label: 'Earn', href: '/earn' },
    { label: 'Fund', href: '/fund' },
    { label: 'RH journal', href: '/journal' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const resourceLinks = [
    { label: 'About', href: '/about' },
    { label: 'Documentation', href: 'https://docs.researchhub.com/' },
    { label: 'Foundation', href: 'https://researchhub.foundation/' },
  ];

  const supportLinks: Array<{ label: string; href?: string; action?: string }> = [
    { label: 'Support', href: 'https://airtable.com/appuhMJaf1kb3ic8e/pagYeh6cB9sgiTIgx/form' },
    { label: 'Terms of service', href: '/about/tos' },
    { label: 'Privacy policy', href: '/about/privacy' },
    { label: 'Contact', action: 'contact' },
  ];

  const journalLinks = [
    {
      label: 'Submit to journal',
      href: '/paper/create/pdf',
      requiresAuth: true,
    },
    {
      label: 'Get paid to peer review',
      href: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    },
    {
      label: 'Author guidelines',
      href: 'https://drive.google.com/file/d/1qKlGnNSA-98kg-RhmTFKYVB85X0PJWYr/view?usp=sharing',
    },
  ];

  const socialLinks = [
    {
      href: 'https://x.com/researchhub',
      icon: faXTwitter,
      label: 'Follow us on X (Twitter)',
    },
    {
      href: 'https://discord.com/invite/ZcCYgcnUp5',
      icon: faDiscord,
      label: 'Join our Discord',
    },
    {
      href: 'https://github.com/ResearchHub',
      icon: faGithub,
      label: 'View our GitHub',
    },
    {
      href: 'https://www.linkedin.com/company/researchhubtechnologies',
      icon: faLinkedin,
      label: 'Connect on LinkedIn',
    },
  ];

  const handleAuthenticatedLink = (href: string) => {
    executeAuthenticatedAction(() => {
      window.location.href = href;
    });
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Logo size={48} color={colors.rhBlue[500]} />
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
              The world's first scientific economy where researchers earn transactable rewards for
              their work and donations turn into research in real-time.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors duration-200"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  aria-label={social.label}
                >
                  <FontAwesomeIcon icon={social.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:opacity-80 transition-colors duration-200"
                    style={{ '--hover-color': colors.rhBlue[500] } as React.CSSProperties}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li key="notebook">
                <button
                  onClick={() => handleAuthenticatedLink('/notebook')}
                  className="text-gray-600 hover:opacity-80 transition-colors duration-200 text-left"
                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                >
                  Notebook
                </button>
              </li>
            </ul>
          </div>

          {/* ResearchHub Journal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              RH Journal
            </h3>
            <ul className="space-y-3">
              {journalLinks.map((link) => (
                <li key={link.label}>
                  {link.requiresAuth ? (
                    <button
                      onClick={() => handleAuthenticatedLink(link.href)}
                      className="text-gray-600 hover:opacity-80 transition-colors duration-200 text-left"
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-600 hover:opacity-80 transition-colors duration-200"
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-600 hover:opacity-80 transition-colors duration-200"
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4 mt-8">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  {link.action === 'contact' ? (
                    <button
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-gray-600 hover:opacity-80 transition-colors duration-200"
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      target={link.href?.startsWith('http') ? '_blank' : undefined}
                      rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-600 hover:opacity-80 transition-colors duration-200"
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.rhBlue[500])}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-gray-500 text-sm">
            <p>
              © {new Date().getFullYear()} ResearchHub. Made with ❤️ for the scientific community.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </footer>
  );
}
