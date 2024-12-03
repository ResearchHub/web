'use client'

import { 
  HandCoins,     // for funding request
  ScrollText,    // for paper
  GraduationCap, // for grant
  ClipboardCheck,// for review
  Trophy,        // for reward
  Coins,         // for contribution
  LucideIcon, 
  ArrowUp,
  Repeat2,
  MessageSquare,
  Bookmark,
  CircleUser,
  Star,
  BadgeCheck,
  Clock
} from 'lucide-react';
import Link from 'next/link'
import { ProfileTooltip } from './tooltips/ProfileTooltip'
import { FeedEntry, FundingRequestItem, GrantItem, Item, RewardItem } from '@/types/feed'
import { Button } from '@/app/components/ui/Button';
import { UserStack } from './ui/UserStack';
import { useRouter } from 'next/navigation'

// Type guard to check if an item has contributors
const hasContributors = (item: Item): item is FundingRequestItem | GrantItem | RewardItem => {
  return item.type === 'funding_request' || item.type === 'grant';
};

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const getItemTypeConfig = (type: string): { icon: LucideIcon; label: string } => {
  switch (type) {
    case 'funding_request':
      return { icon: HandCoins, label: 'Funding Request' };
    case 'grant':
      return { icon: GraduationCap, label: 'Grant' };
    case 'paper':
      return { icon: ScrollText, label: 'Paper' };
    case 'review':
      return { icon: ClipboardCheck, label: 'Review' };
    case 'reward':
      return { icon: Trophy, label: 'Reward' };
    case 'contribution':
      return { icon: Coins, label: 'Contribution' };
    default:
      return { icon: ScrollText, label: 'Other' };
  }
};

// Define the getItemUrl function
const getItemUrl = (item: Item) => {
  switch (item.type) {
    case 'paper':
      return `/paper/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`;
    case 'funding_request':
      return `/fund/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`;
    case 'grant':
      return `/grant/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`;
    case 'review':
      return `/review/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`;
    case 'reward':
      return `/reward/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`;
    default:
      return '#';
  }
};

export const FeedItem: React.FC<{ entry: FeedEntry }> = ({ entry }) => {
  const router = useRouter()
  if (!entry) {
    return null; // Or return a placeholder/skeleton component
  }

  const { actor, item } = entry
  const isOrganization = actor.isOrganization
  const isBioRxiv = actor.fullName.toLowerCase().includes('biorxiv')

  return (
    <div className="p-6">
      <div className="flex flex-col">
        <div className="flex items-start mb-3">
          <div 
            className="flex-shrink-0 mr-4 cursor-pointer" 
            onClick={() => router.push(`/author/${actor.id}`)}
          >
            {actor.profileImage ? (
              <img 
                src={actor.profileImage} 
                alt={actor.fullName} 
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-gray-200">
                <CircleUser className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <ProfileTooltip
                type={isOrganization ? 'organization' : 'user'}
                name={actor.fullName}
                headline={isOrganization ? 'Organization' : 'Researcher'}
                verified={actor.isVerified}
              >
                <span 
                  onClick={() => router.push(`/author/${actor.id}`)}
                  className="font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                >
                  {actor.fullName}
                </span>
              </ProfileTooltip>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {entry.action === 'contribute' && <span>Contributed ResearchCoin</span>}
              {entry.action === 'review' && <span>Reviewed a paper</span>}
              {entry.action === 'publish' && (
                <span>{item.type === 'paper' ? 'Published a paper' : 'Published content'}</span>
              )}
              {entry.action === 'share' && <span>Shared a {item.type}</span>}
              {entry.action === 'post' && (
                <span>
                  {item.type === 'funding_request' && 'Started a fundraise'}
                  {item.type === 'grant' && 'Posted a grant'}
                  {item.type === 'reward' && 'Posted a reward'}
                </span>
              )}
              <span>•</span>
              <span>{entry.timestamp}</span>
              {item.hub && (
                <>
                  <span>•</span>
                  <Link href={`/hub/${item.hub.slug}`} className="text-indigo-600 hover:text-indigo-700">
                    {item.hub.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
  
        <div 
          onClick={() => window.location.href = getItemUrl(item)} 
          className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200">
              {(() => {
                const IconComponent = getItemTypeConfig(item.type).icon;
                return <IconComponent className="w-3 h-3 mr-1" />;
              })()}
              {getItemTypeConfig(item.type).label}
            </div>
          </div>
  
          {item.type === 'paper' && (
            <>
              <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center text-sm mb-3">
                <div className="flex-1 text-xs text-gray-600">
                  {item.authors.map((author, i) => (
                    <span key={i} className="inline-flex items-center">
                      <span>{author.name}</span>
                      {author.verified && (
                        <BadgeCheck className="h-4 w-4 text-blue-500 ml-1" />
                      )}
                      {i < item.authors.length - 1 && (
                        <span className="mx-2 text-gray-400">•</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {item.description.length > 200 
                  ? `${item.description.slice(0, 200)}...` 
                  : item.description}
              </p>
            </>
          )}
  
          {item.type === 'funding_request' && (
            <>
              <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {item.description.length > 200 
                  ? `${item.description.slice(0, 200)}...` 
                  : item.description}
              </p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">{formatNumber(item.amount)} RSC raised</span>
                    <span className="text-sm text-gray-500">of {formatNumber(item.goalAmount)} RSC goal</span>
                  </div>
                  {item.progress === 100 && (
                    <span className="text-sm text-green-500 font-medium">Fundraise Completed</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
  
  
              <div className="flex justify-between">
                <Button variant="researchcoin" size={"sm"} className="w-30 space-x-2">
                  <Coins className="h-4 w-4" />
                  <span>Contribute</span>
                </Button>
                {hasContributors(item) && item.contributors && (
                  <div className="flex items-center ml-4">
                    <UserStack 
                      users={item.contributors.map(c => c)} 
                      imageSize="sm"
                    />
                  </div>
                )}
              </div>
            </>
          )}
  
          {item.type === 'grant' && (
            <div className="space-y-4">
              <Link href={`/grant/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`}>
                <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {item.description.length > 200 
                    ? `${item.description.slice(0, 200)}...` 
                    : item.description}
                </p>
              </Link>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-500 font-medium">{formatNumber(item.amount)} RSC</span>
                </div>
                {item.deadline && (
                  <>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-500">Due in {item.deadline}</span>
                    </div>
                  </>
                )}
              </div>
  
              <div className="flex items-center justify-between mt-4">
                <Button size="sm" className="w-24">Apply Now</Button>
                
                {item.applicants && item.applicants.length > 0 && (
                  <div className="flex items-center gap-2">
                    <UserStack imageSize='sm' users={item.applicants} />
                    <span className="text-sm text-muted-foreground">
                      Applicant{item.applicants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
  
          {item.type === 'reward' && (
            <>
              <Link href={`/reward/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`}>
                <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {item.description.length > 200 
                    ? `${item.description.slice(0, 200)}...` 
                    : item.description}
                </p>
              </Link>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-500 font-medium">{formatNumber(item.amount)} RSC reward</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Due in {item.deadline}</span>
                  </div>
                </div>
                <div>
                  <Button size="sm" variant="default" className="w-24">
                    Learn more
                  </Button>
                </div>
              </div>
            </>
          )}
  
          {item.type === 'review' && (
            <>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {item.description.length > 200 
                  ? `${item.description.slice(0, 200)}...` 
                  : item.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Score:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < (item.metrics.reviewScore || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
  
          {item.type === 'contribution' && (
            <>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {item.description.length > 200 
                  ? `${item.description.slice(0, 200)}...` 
                  : item.description}
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <Coins className="h-4 w-4 text-orange-500" />
                <span className="text-orange-500 font-medium">Earned {formatNumber(item.amount)} RSC</span>
              </div>
            </>
          )}
        </div>
  
        <div className="mt-3 flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="metric" 
            tooltip="Vote"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="text-sm">{item.metrics.votes}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="metric" 
            tooltip="Repost"
            className="space-x-1"
          >
            <Repeat2 className="h-5 w-5" />
            <span className="text-sm">{item.metrics.reposts}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="metric" 
            tooltip="Comment"
            className="space-x-1"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">{item.metrics.comments}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="metric" 
            tooltip="Save"
            className="space-x-1"
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-sm">{item.metrics.saves}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};