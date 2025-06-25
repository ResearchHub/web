'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { Icon } from '@/components/ui/icons/Icon';
import { BookCheck, TicketCheck, TextSelect, Dna, Check } from 'lucide-react';
import Link from 'next/link';

export const FundRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(['why-fund']); // Default open section

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-6 sticky top-[64px] h-[calc(100vh-64px)] w-80 bg-white/95 backdrop-blur-md border-gray-100 overscroll-contain">
      <div className="h-full overflow-y-auto pb-16 px-6 pt-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="bg-primary-50 rounded-lg shadow-sm border border-primary-100 p-5 mb-6">
          <h3 className="text-lg font-semibold mb-1 text-primary-800 flex items-center gap-2">
            <Icon name="fundYourRsc2" size={20} color="currentColor" />
            Get Funded.
          </h3>
          <p className="text-primary-700 mb-3 text-sm">
            Share a research proposal and get crowdfunded by the community.
          </p>
          <ul className="text-primary-700 mb-4 text-sm space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-primary-500" strokeWidth={3} />
              Early expert feedback
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-primary-500" strokeWidth={3} />
              Donors get tax deductions
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-primary-500" strokeWidth={3} />
              <strong>Fully discretionary funds</strong>
            </li>
          </ul>
          {/* Button to write a proposal */}
          <Button asChild className="w-full bg-primary-600 hover:bg-primary-700">
            <Link href="/notebook?newFunding=true">Request funding</Link>
          </Button>
        </div>

        {/* Informational Sections */}
        <CollapsibleSection title="Crowdfunding for science?">
          <CollapsibleItem
            title="Open access by default"
            icon={<BookCheck className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('reproducibility')}
            onToggle={() => toggleSection('reproducibility')}
          >
            Funds are raised for open access proposals, which pre-define methods and analysis plans,
            proven to increase the reproducibility of downstream research.
          </CollapsibleItem>

          <CollapsibleItem
            title="Tax-deductible donations"
            icon={<TicketCheck className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('tax-benefits')}
            onToggle={() => toggleSection('tax-benefits')}
          >
            For donations of $500+ to projects at qualifying nonprofits, you'll receive a
            tax-deductible receipt for your RSC contribution from our partner{' '}
            <Link
              href="https://endaoment.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Endaoment
            </Link>
            , a 501(c)(3) organization.
          </CollapsibleItem>

          <CollapsibleItem
            title="Incentivized transparency"
            icon={<TextSelect className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('transparent')}
            onToggle={() => toggleSection('transparent')}
          >
            Researchers are tipped extra discretionary funds to optionally update their work as
            updates and progress are made.
          </CollapsibleItem>

          <CollapsibleItem
            title="Direct & flexible funding"
            icon={<Dna className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('low-overhead')}
            onToggle={() => toggleSection('low-overhead')}
          >
            Funds reach university accounts as fully discretionary – free from restrictive grant
            limitations. ResearchHub often enables 0% indirect university costs by replacing
            traditional reporting with modular incentives.
          </CollapsibleItem>
        </CollapsibleSection>

        <CollapsibleSection title="How does it work?">
          <CollapsibleItem
            title="1. Preregister experiment"
            isOpen={openSections.includes('preregister')}
            onToggle={() => toggleSection('preregister')}
          >
            Researchers plan their experiment in the open, providing all relevant methodological
            details and planned analyses openly before receiving funding.
          </CollapsibleItem>
          <CollapsibleItem
            title="2. Expert peer review"
            isOpen={openSections.includes('peer-review')}
            onToggle={() => toggleSection('peer-review')}
          >
            Experts and the community review the proposal, providing feedback to improve rigor and
            reproducibility, offering insight into the work.
          </CollapsibleItem>
          <CollapsibleItem
            title="3. Link a nonprofit (Recommended)"
            isOpen={openSections.includes('tax-deduct')}
            onToggle={() => toggleSection('tax-deduct')}
          >
            Researchers can coordinate with a qualifying nonprofit via the lab notebook to enable
            tax deductions for donors and improved processing of funds.
          </CollapsibleItem>
          <CollapsibleItem
            title="4. Contribute funds"
            isOpen={openSections.includes('pledge')}
            onToggle={() => toggleSection('pledge')}
          >
            Users review the proposal and peer feedback, then contribute funds (any amount) directly
            to the projects they support via RSC or USD.
          </CollapsibleItem>
          <CollapsibleItem
            title="5. Fund are disbursed"
            isOpen={openSections.includes('disburse')}
            onToggle={() => toggleSection('disburse')}
          >
            Once fully raised,{' '}
            <Link
              href="https://endaoment.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Endaoment
            </Link>{' '}
            provides nonprofit support, asset conversion, and sends contributions directly to the
            institution or researcher.
          </CollapsibleItem>
          <CollapsibleItem
            title="6. Funds arrive"
            isOpen={openSections.includes('unrestricted')}
            onToggle={() => toggleSection('unrestricted')}
          >
            Funds arrive in the researcher's discretionary spending account at their institution,
            free from traditional grant restrictions on usage.
          </CollapsibleItem>
        </CollapsibleSection>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  );
};
