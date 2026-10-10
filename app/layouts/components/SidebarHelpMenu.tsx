'use client';

import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowUpRight,
  BookOpen,
  ChevronUp,
  CircleHelp,
  Info,
  LifeBuoy,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChangelogSeen } from '@/components/changelog/useChangelogSeen';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

const RESOURCE_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Docs', href: 'https://docs.researchhub.com/', icon: BookOpen },
  {
    label: 'Support',
    href: 'https://airtable.com/appuhMJaf1kb3ic8e/pagYeh6cB9sgiTIgx/form',
    icon: LifeBuoy,
  },
  { label: 'About', href: 'https://www.researchhub.com/about', icon: Info },
];

const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/researchhub', icon: faXTwitter },
  { label: 'Discord', href: 'https://discord.com/invite/ZcCYgcnUp5', icon: faDiscord },
  { label: 'GitHub', href: 'https://github.com/ResearchHub', icon: faGithub },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/researchhubtechnologies',
    icon: faLinkedin,
  },
];

const LEGAL_LINKS = [
  { label: 'Terms', href: 'https://www.researchhub.com/tos' },
  { label: 'Privacy', href: 'https://www.researchhub.com/privacy' },
];

const CURRENCIES = ['USD', 'RSC'] as const;

const MENU_ROW =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 outline-none transition-colors data-[highlighted]:bg-gray-50';

const SEPARATOR = 'mx-1 my-1.5 h-px bg-gray-100';

/**
 * The sidebar's footer as a single row. What used to be spread across it (the
 * changelog, docs, support, currency, socials and legal links) opens from it
 * in one menu, so the column keeps its height for navigation and documents.
 */
export function SidebarHelpMenu() {
  const { hasSeen: hasSeenChangelog, markSeen: markChangelogSeen } = useChangelogSeen();
  const { showUSD, toggleCurrency } = useCurrencyPreference();
  const currency = showUSD ? 'USD' : 'RSC';

  return (
    <div className="border-t border-gray-100 p-2">
      <BaseMenu
        side="top"
        align="start"
        sideOffset={6}
        className="w-56 rounded-xl p-1.5 shadow-lg"
        trigger={
          <button
            type="button"
            className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 data-[state=open]:bg-gray-100"
          >
            <CircleHelp className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">Help & resources</span>
            {!hasSeenChangelog && <RadiatingDot color="bg-orange-500" size="sm" />}
            <ChevronUp
              className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </button>
        }
      >
        <DropdownMenu.Item asChild onSelect={markChangelogSeen}>
          <Link href="/changelog" className={MENU_ROW}>
            <Megaphone className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span className="flex-1">What’s new</span>
            {!hasSeenChangelog && (
              <span className="rounded-full bg-orange-50 px-1.5 text-[11px] font-semibold text-orange-700">
                New
              </span>
            )}
          </Link>
        </DropdownMenu.Item>
        {RESOURCE_LINKS.map(({ label, href, icon: Icon }) => (
          <DropdownMenu.Item key={label} asChild>
            <a href={href} target="_blank" rel="noopener noreferrer" className={MENU_ROW}>
              <Icon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
            </a>
          </DropdownMenu.Item>
        ))}

        <DropdownMenu.Separator className={SEPARATOR} />

        <div className="flex items-center justify-between py-1 pl-2.5 pr-1">
          <span className="text-[13px] text-gray-600">Currency</span>
          <DropdownMenu.RadioGroup
            value={currency}
            onValueChange={(value) => {
              if (value !== currency) toggleCurrency();
            }}
            className="inline-flex rounded-lg bg-gray-100 p-0.5"
          >
            {CURRENCIES.map((option) => (
              <DropdownMenu.RadioItem
                key={option}
                value={option}
                // Keep the menu open so the switch reads as a control, not a link.
                onSelect={(event) => event.preventDefault()}
                className="cursor-pointer rounded-md px-2.5 py-0.5 text-xs font-medium text-gray-500 outline-none transition-colors data-[highlighted]:text-gray-900 data-[state=checked]:bg-white data-[state=checked]:font-semibold data-[state=checked]:text-gray-900 data-[state=checked]:shadow-sm"
              >
                {option}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </div>

        <DropdownMenu.Separator className={SEPARATOR} />

        <div className="flex items-center px-0.5">
          {SOCIAL_LINKS.map(({ label, href, icon }) => (
            <DropdownMenu.Item key={label} asChild>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 outline-none transition-colors data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-800"
              >
                <FontAwesomeIcon icon={icon} className="h-[15px] w-[15px]" />
              </a>
            </DropdownMenu.Item>
          ))}
          <span className="flex-1" />
          <span className="flex items-center gap-1 pr-1.5 text-xs text-gray-500">
            {LEGAL_LINKS.map(({ label, href }, index) => (
              <span key={label} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">·</span>}
                <DropdownMenu.Item asChild>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer rounded outline-none hover:text-gray-800 data-[highlighted]:text-gray-800 data-[highlighted]:underline"
                  >
                    {label}
                  </a>
                </DropdownMenu.Item>
              </span>
            ))}
          </span>
        </div>
      </BaseMenu>
    </div>
  );
}
