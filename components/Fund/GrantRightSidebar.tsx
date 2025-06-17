'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { Icon } from '@/components/ui/icons/Icon';
import { CircleCheckBig, Check, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const GrantRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(['why-preregistration']); // Default open section

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-6 top-[64px] h-[calc(100vh-64px)] w-80 bg-white/95 backdrop-blur-md border-gray-100 overscroll-contain">
      <div className="h-full overflow-y-auto pb-16 px-6 pt-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="bg-primary-50 rounded-lg shadow-sm border border-primary-100 p-5 mb-6">
          <h3 className="text-lg font-semibold mb-1 text-primary-800 flex items-center gap-2">
            <Icon name="fund2" size={20} color="currentColor" />
            Fund Smarter.
          </h3>
          <p className="text-primary-700 mb-3 text-sm">
            Make every research dollar count with preregistration-based funding.{' '}
          </p>
          <ul className="text-primary-700 mb-4 text-sm space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-primary-500" strokeWidth={2.5} />
              Preregistered research
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-primary-500" strokeWidth={2.5} />
              Open peer review
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-primary-500" strokeWidth={2.5} />
              <strong>Regular progress updates</strong>
            </li>
          </ul>
          <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
            <Link href="/notebook?newGrant=true">Launch a grant</Link>
          </Button>
        </div>

        <CollapsibleSection title="Preregistration = better science">
          <CollapsibleItem
            title="Prevents p-hacking"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('prevents-hacking')}
            onToggle={() => toggleSection('prevents-hacking')}
          >
            When researchers outline analyses beforehand, they're reputationally incentivized to
            explain any deviations.
          </CollapsibleItem>

          <CollapsibleItem
            title="Incentivizes results sharing"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('forces-publication')}
            onToggle={() => toggleSection('forces-publication')}
          >
            Public preregistration creates reputation pressure to publish findings—positive or
            negative—preventing selective reporting.
          </CollapsibleItem>

          <CollapsibleItem
            title="Enables independent replication"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('enables-replication')}
            onToggle={() => toggleSection('enables-replication')}
          >
            Open methodology makes it easy for other researchers to independently verify results,
            increasing scientific reliability.
          </CollapsibleItem>

          <CollapsibleItem
            title="Expert review before funding"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('expert-review')}
            onToggle={() => toggleSection('expert-review')}
          >
            Expert reviewers on ResearchHub evaluate methodology quality before you invest, reducing
            funding risk.
          </CollapsibleItem>
        </CollapsibleSection>

        <CollapsibleSection title="But wait there's more...">
          <CollapsibleItem
            title="Faster decisions"
            icon={<CircleCheckBig className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('faster-decisions')}
            onToggle={() => toggleSection('faster-decisions')}
          >
            Skip lengthy grant applications. Review clear preregistrations with methodology and
            budget in one place—fund in days, not months.
          </CollapsibleItem>

          <CollapsibleItem
            title="Lower administrative costs"
            icon={<CircleCheckBig className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('lower-costs')}
            onToggle={() => toggleSection('lower-costs')}
          >
            Funds reach researchers within 2 weeks. Often 0% overhead to university, maximizing
            research impact per dollar.
          </CollapsibleItem>

          <CollapsibleItem
            title="Expert quality control"
            icon={<CircleCheckBig className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('quality-control')}
            onToggle={() => toggleSection('quality-control')}
          >
            Our expert reviewers ensure your funded research gets immediate attention from leading
            minds in the field, maximizing its scientific impact from day one.
          </CollapsibleItem>

          <CollapsibleItem
            title="Complete accountability"
            icon={<CircleCheckBig className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('accountability')}
            onToggle={() => toggleSection('accountability')}
          >
            Track your funding from preregistration to publication. All results are incentivized to
            be sharedpublished openly, giving you visibility into research outcomes.
          </CollapsibleItem>

          <CollapsibleItem
            title="Tax benefits available"
            icon={<CircleCheckBig className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('tax-benefits')}
            onToggle={() => toggleSection('tax-benefits')}
          >
            Donations to 501(c)(3)-affiliated researchers are tax-deductible through our partner
            Endaoment, maximizing your philanthropic impact.
          </CollapsibleItem>
        </CollapsibleSection>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  );
};
