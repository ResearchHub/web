'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import {
  BookOpen,
  Users,
  UserCheck,
  Trophy,
  Check,
  Zap,
  Globe,
  MessageSquare,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export const BrowseRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(['create-hub']); // Default open section

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-6 sticky top-[64px] max-h-[calc(100vh-64px)] w-80 bg-white/95 backdrop-blur-md border-gray-100 overscroll-contain">
      <div className="h-full overflow-y-auto pb-24 px-6 pt-6 scrollbar-track-transparent">
        {/* Create Hub CTA */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-xl shadow-lg border border-purple-200 p-6 mb-6 overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 text-white">🚀 Launch Your Hub</h3>
            <p className="text-white/90 mb-4 text-sm leading-relaxed">
              Create your own research community or journal and connect with brilliant minds
              worldwide.
            </p>
            <ul className="text-white/80 mb-5 text-sm space-y-2">
              <li className="flex items-center gap-3">
                <Users className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2.5} />
                <span>
                  <strong className="text-white">Build a research network</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <ResearchCoinIcon
                  size={18}
                  outlined
                  color="white"
                  fill="transparent"
                  className="flex-shrink-0"
                />
                <span>
                  <strong className="text-white">Earn ResearchCoin</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2.5} />
                <span>
                  <strong className="text-white">Speed up peer review process</strong>
                </span>
              </li>
            </ul>
            {/* Button to create hub */}
            <Link href="/hub/create">
              <Button className="w-full bg-white text-purple-600 hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group">
                <span className="flex items-center justify-center gap-2">
                  Create Hub Now
                  <div className="group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </div>
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Journal Benefits Section */}
        <CollapsibleSection title="For Journals">
          <CollapsibleItem
            title="Free hosting platform"
            icon={<Globe className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('hosting')}
            onToggle={() => toggleSection('hosting')}
          >
            Get professional journal hosting on ResearchHub with no setup costs. We handle all the
            technical infrastructure so you can focus on publishing quality research.
          </CollapsibleItem>

          <CollapsibleItem
            title="Fast peer review system"
            icon={<UserCheck className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('peer-review')}
            onToggle={() => toggleSection('peer-review')}
          >
            Connect with qualified peer reviewers quickly through our network of verified
            researchers. Streamline your review process and reduce publication timelines.
          </CollapsibleItem>

          <CollapsibleItem
            title="ResearchCoin eligibility"
            icon={<Trophy className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('researchcoin')}
            onToggle={() => toggleSection('researchcoin')}
          >
            Publications in your journal become eligible for ResearchCoin rewards, incentivizing
            high-quality submissions and attracting top researchers to your platform.
          </CollapsibleItem>

          <CollapsibleItem
            title="Enhanced visibility"
            icon={<Zap className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('visibility')}
            onToggle={() => toggleSection('visibility')}
          >
            Reach a broader audience through ResearchHub's growing community of researchers. Your
            publications get automatic social media integration and discovery features.
          </CollapsibleItem>
        </CollapsibleSection>

        {/* Community Benefits Section */}
        <CollapsibleSection title="For Communities">
          <CollapsibleItem
            title="Build your research network"
            icon={<Users className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('network')}
            onToggle={() => toggleSection('network')}
          >
            Create a dedicated space for researchers in your field to collaborate, share findings,
            and build lasting professional relationships around shared research interests.
          </CollapsibleItem>

          <CollapsibleItem
            title="Organize discussions"
            icon={<MessageSquare className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('discussions')}
            onToggle={() => toggleSection('discussions')}
          >
            Host structured discussions about research topics, facilitate knowledge sharing, and
            create a vibrant community around your area of expertise.
          </CollapsibleItem>

          <CollapsibleItem
            title="Share resources"
            icon={<BookOpen className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('resources')}
            onToggle={() => toggleSection('resources')}
          >
            Curate and share important research papers, datasets, tools, and educational materials
            with your community members in an organized, searchable format.
          </CollapsibleItem>

          <CollapsibleItem
            title="Community governance"
            icon={<Shield className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('governance')}
            onToggle={() => toggleSection('governance')}
          >
            Set community guidelines, moderate discussions, and maintain quality standards to ensure
            your hub remains a productive and professional environment.
          </CollapsibleItem>
        </CollapsibleSection>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
};
