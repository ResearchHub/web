import { 
  Coins, 
  ChevronDown, 
  FileText, 
  Hash, 
  Check, 
  BookOpen,
  Users,
  Tag,
  Heading
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/menus/BaseMenu';
import { GrantIcon } from '@/components/ui/icons/GrantIcon';
import { Switch } from '@/components/ui/Switch';
import { useState } from 'react';
import { cn } from '@/utils/styles';

type ArticleType = 'research' | 'grant';

interface PublishingSidebarProps {
  articleType: ArticleType;
  setArticleType: (type: ArticleType) => void;
  bountyAmount: number | null;
  onBountyClick: () => void;
  onPublishClick: () => void;
  title: string;
  onTitleChange: (title: string) => void;
}

const SectionHeader = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
  <div className="mb-3">
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="h-4 w-4 text-gray-700" />
      <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">{children}</h3>
    </div>
  </div>
);

export const PublishingSidebar = ({
  articleType,
  setArticleType,
  bountyAmount,
  onBountyClick,
  onPublishClick,
  title,
  onTitleChange,
}: PublishingSidebarProps) => {
  const [isJournalEnabled, setIsJournalEnabled] = useState(false);
  
  const articleTypes = {
    research: 'Original research article',
    grant: 'Grant (Request for Proposal)',
  };

  const renderSelectedIcon = () => {
    if (articleType === 'research') {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
    return <GrantIcon size={16} className="text-gray-500" />;
  };

  return (
    <div className="w-80 border-l flex flex-col h-screen sticky right-0 top-0 bg-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-6">

          {/* Paper Title Input */}
          <div className="py-4 px-6">
            <SectionHeader icon={Heading}>Title</SectionHeader>
            <div className="mt-3">
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter the title of your paper..."
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Article Type Section */}
          <div className="py-4 px-6">
            <SectionHeader icon={FileText}>Article Type</SectionHeader>
            <div className="mt-3">
              <BaseMenu
                trigger={
                  <button className="border w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    {articleTypes[articleType]}
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </button>
                }
                align="start"
              >
                <div className="text-[.65rem] font-semibold mb-1 uppercase text-neutral-500 px-2">
                  Article Type
                </div>
                <BaseMenuItem
                  onClick={() => setArticleType('research')}
                  className={articleType === 'research' ? 'bg-gray-100' : ''}
                >
                  Original research article
                </BaseMenuItem>
                <BaseMenuItem
                  onClick={() => setArticleType('grant')}
                  className={articleType === 'grant' ? 'bg-gray-100' : ''}
                >
                  Grant (Request for Proposal)
                </BaseMenuItem>
              </BaseMenu>
            </div>
          </div>

          {/* Authors Section */}
          <div className="py-4 px-6">
            <SectionHeader icon={Users}>Authors</SectionHeader>
            <div className="mt-3 text-sm text-gray-500">
              Add authors to your article
            </div>
          </div>

          {/* Topics Section */}
          <div className="py-4 px-6">
            <SectionHeader icon={Tag}>Topics</SectionHeader>
            <div className="mt-3">
              <Button
                variant="outlined"
                onClick={() => {}}
                className="w-full flex items-center gap-2 justify-center"
              >
                <Hash className="h-4 w-4" />
                Add Topics
              </Button>
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Example topics - these should be dynamic */}
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  <Hash className="h-3 w-3" />
                  <span>Biochemistry</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  <Hash className="h-3 w-3" />
                  <span>Cell Biology</span>
                </div>
              </div>
            </div>
          </div>

          {/* ResearchCoin Section */}
          <div className="py-4 px-6">
            <SectionHeader icon={Coins}>ResearchCoin</SectionHeader>
            <div className="mt-3">
              {bountyAmount ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">{bountyAmount} RSC</span>
                </div>
              ) : (
                <Button
                  variant="outlined"
                  onClick={onBountyClick}
                  className="w-full flex items-center gap-2 justify-center"
                >
                  <Coins className="h-4 w-4" />
                  Add Bounty
                </Button>
              )}
            </div>
          </div>

          {/* ResearchHub Journal Section */}
          <div className="py-4 px-6">
            <SectionHeader icon={BookOpen}>ResearchHub Journal</SectionHeader>
            <div className="mt-3">
              <div className="p-3 bg-gradient-to-b from-indigo-50/80 to-white rounded-lg border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Price:</span>
                      <span className="text-xs font-medium text-indigo-600">$1,000 USD</span>
                    </div>
                  </div>
                  <Switch 
                    checked={isJournalEnabled}
                    onCheckedChange={setIsJournalEnabled}
                  />
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check 
                      className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-gray-600">Accredited journal publication with low APCs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check 
                      className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-gray-600">Rapid decision (21 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check 
                      className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-gray-600">3x paid Peer Reviews</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom section */}
      <div className="border-t bg-white p-6 space-y-3 sticky bottom-0">
        {isJournalEnabled && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment due:</span>
            <span className="font-medium text-gray-900">$1,000 USD</span>
          </div>
        )}
        <Button
          variant="default"
          onClick={onPublishClick}
          className="w-full"
        >
          {isJournalEnabled ? 'Pay & Publish' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}; 