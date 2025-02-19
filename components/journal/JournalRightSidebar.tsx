import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { Clock, FileText, Users, Target, Lock } from 'lucide-react';

export function JournalRightSidebar() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Editorial Board Section */}
      <div className="bg-white rounded-xl">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Editorial Board</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              src="https://www.researchhub.com/static/editorial-board/MaulikDhandha.jpeg"
              alt="Maulik M. Dhandha"
              size="md"
              ring
            />
            <div>
              <h3 className="font-medium text-gray-900">Maulik M. Dhandha, MD FAAD</h3>
              <p className="text-sm text-gray-600">Editor in Chief</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar
              src="https://www.researchhub.com/static/editorial-board/EmilioMerheb.jpeg"
              alt="Emilio Merheb"
              size="md"
              ring
            />
            <div>
              <h3 className="font-medium text-gray-900">Emilio Merheb, PhD</h3>
              <p className="text-sm text-gray-600">Associate Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar
              src="https://www.researchhub.com/static/editorial-board/AttilaKarsi.jpeg"
              alt="Attila Karsi"
              size="md"
              ring
            />
            <div>
              <h3 className="font-medium text-gray-900">Attila Karsi, PhD</h3>
              <p className="text-sm text-gray-600">Associate Editor</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <CollapsibleSection title="How it Works">
        <CollapsibleItem
          title="Timeline"
          isOpen={openSection === 'timeline'}
          onToggle={() => setOpenSection(openSection === 'timeline' ? null : 'timeline')}
          icon={<Clock className="h-4 w-4" />}
        >
          <p>Learn about our streamlined publication timeline and process.</p>
        </CollapsibleItem>

        <CollapsibleItem
          title="Author Guidelines"
          isOpen={openSection === 'guidelines'}
          onToggle={() => setOpenSection(openSection === 'guidelines' ? null : 'guidelines')}
          icon={<FileText className="h-4 w-4" />}
        >
          <p>Detailed guidelines for preparing and submitting your manuscript.</p>
        </CollapsibleItem>

        <CollapsibleItem
          title="Peer Reviewers"
          isOpen={openSection === 'reviewers'}
          onToggle={() => setOpenSection(openSection === 'reviewers' ? null : 'reviewers')}
          icon={<Users className="h-4 w-4" />}
        >
          <p>Information about our peer review process and reviewer selection.</p>
        </CollapsibleItem>

        <CollapsibleItem
          title="Aims and Scope"
          isOpen={openSection === 'aims'}
          onToggle={() => setOpenSection(openSection === 'aims' ? null : 'aims')}
          icon={<Target className="h-4 w-4" />}
        >
          <p>Learn about the journal's focus areas and publication criteria.</p>
        </CollapsibleItem>

        <CollapsibleItem
          title="Open Access Policies"
          isOpen={openSection === 'policies'}
          onToggle={() => setOpenSection(openSection === 'policies' ? null : 'policies')}
          icon={<Lock className="h-4 w-4" />}
        >
          <p>Details about our open access policies and licensing.</p>
        </CollapsibleItem>
      </CollapsibleSection>
    </div>
  );
}
