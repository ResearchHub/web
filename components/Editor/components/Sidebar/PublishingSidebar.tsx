import {
  Coins,
  ChevronDown,
  FileText,
  Hash,
  Check,
  BookOpen,
  Users,
  Tag,
  DollarSign,
  Wallet,
  Plus,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/menus/BaseMenu';
import { GrantIcon } from '@/components/ui/icons/GrantIcon';
import { Switch } from '@/components/ui/Switch';
import { useState } from 'react';
import { cn } from '@/utils/styles';
import {
  FundingForm,
  type FundingFormData,
} from '@/components/Editor/components/Funding/FundingForm';
import { PublishModal } from '@/components/modals/PublishModal';

export type ArticleType = 'research' | 'preregistration' | 'other';

interface PublishingSidebarProps {
  articleType: ArticleType;
  setArticleType: (type: ArticleType) => void;
  bountyAmount: number | null;
  onBountyClick: () => void;
  onPublishClick: () => void;
  title: string;
  onTitleChange: (title: string) => void;
}

const SectionHeader = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="mb-2">
    <div className="flex items-center gap-1.5 mb-1.5">
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
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [fundingData, setFundingData] = useState<FundingFormData>({
    budget: '',
    rewardFunders: false,
    nftArt: null,
    nftSupply: '1000',
  });

  const articleTypes = {
    research: {
      title: 'Original Research Work',
      description: 'Submit your original research',
    },
    preregistration: {
      title: 'Preregistration',
      description: 'Get funding by sharing your research plan',
    },
    other: {
      title: 'Other',
      description: 'Literature review, hypothesis, question, etc.',
    },
  };

  const renderSelectedIcon = () => {
    if (articleType === 'research') {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
    if (articleType === 'preregistration') {
      return <Wallet className="h-4 w-4 text-gray-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const handleFundingSubmit = (data: FundingFormData) => {
    setFundingData(data);
  };

  const handlePublishClick = () => {
    setIsPublishModalOpen(true);
  };

  return (
    <>
      <div className="w-82 border-l flex flex-col h-screen sticky right-0 top-0 bg-white">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <div className="pb-6">
            {/* Work Type Section - Now First */}
            <div className="py-3 px-6">
              <SectionHeader icon={FileText}>Work Type</SectionHeader>
              <div className="mt-2">
                <BaseMenu
                  trigger={
                    <button className="border w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        {renderSelectedIcon()}
                        <span>{articleTypes[articleType].title}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </button>
                  }
                  align="start"
                  className="w-[300px]"
                >
                  <div className="text-[.65rem] font-semibold mb-1 uppercase text-neutral-500 px-2">
                    Work Type
                  </div>
                  {Object.entries(articleTypes).map(([type, info]) => (
                    <BaseMenuItem
                      key={type}
                      onClick={() => setArticleType(type as ArticleType)}
                      className={cn(
                        'flex flex-col items-start py-3',
                        articleType === type ? 'bg-gray-100' : ''
                      )}
                    >
                      <div className="font-medium text-gray-900">{info.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{info.description}</div>
                    </BaseMenuItem>
                  ))}
                </BaseMenu>

                {articleType === 'preregistration'}
              </div>
            </div>

            {/* Authors Section */}
            <div className="py-3 px-6">
              <SectionHeader icon={Users}>Authors</SectionHeader>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Plus className="h-4 w-4 text-gray-400" />
                Add authors to your work
              </div>
            </div>

            {/* Topics Section */}
            <div className="py-3 px-6">
              <SectionHeader icon={Tag}>Topics</SectionHeader>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Plus className="h-4 w-4 text-gray-400" />
                  Add topics to your work
                </div>
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

            {/* Funding Section - Only for Preregistration */}
            {articleType === 'preregistration' && (
              <div className="py-3 px-6">
                <FundingForm
                  onSubmit={handleFundingSubmit}
                  initialData={fundingData}
                  className="mt-2"
                />
              </div>
            )}

            {/* ResearchCoin Section - Only for Research and Other */}
            {articleType !== 'preregistration' && (
              <div className="py-3 px-6">
                <SectionHeader icon={Coins}>ResearchCoin</SectionHeader>
                <div className="mt-2">
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
            )}

            {/* ResearchHub Journal Section - Only for Research */}
            {articleType === 'research' && (
              <div className="py-3 px-6">
                <SectionHeader icon={BookOpen}>ResearchHub Journal</SectionHeader>
                <div className="mt-2">
                  <div className="p-3 bg-gradient-to-b from-indigo-50/80 to-white rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Price:</span>
                          <span className="text-xs font-medium text-indigo-600">$1,000 USD</span>
                        </div>
                      </div>
                      <Switch checked={isJournalEnabled} onCheckedChange={setIsJournalEnabled} />
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check
                          className="h-[18px] w-[18px] mt-0.5 text-indigo-600 flex-shrink-0"
                          strokeWidth={2}
                        />
                        <span className="text-sm text-gray-600">
                          Accredited journal publication with low APCs
                        </span>
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
            )}
          </div>
        </div>

        {/* Sticky bottom section */}
        <div className="border-t bg-white p-6 space-y-3 sticky bottom-0">
          {articleType === 'research' && isJournalEnabled && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment due:</span>
              <span className="font-medium text-gray-900">$1,000 USD</span>
            </div>
          )}
          <Button variant="default" onClick={handlePublishClick} className="w-full">
            {articleType === 'research' && isJournalEnabled ? 'Pay & Publish' : 'Publish'}
          </Button>
        </div>
      </div>

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        articleType={articleType}
        fundingData={fundingData}
        title={title}
      />
    </>
  );
};
