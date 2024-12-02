'use client'

import { 
  ArrowUp, MessageSquare, Bookmark, Share2, CircleUser,
  Coins, BadgeCheck, Repeat2, Clock 
} from 'lucide-react';
import Link from 'next/link'
import { ProfileTooltip } from './tooltips/ProfileTooltip'
import { FeedEntry, FundingRequestItem, GrantItem, Item, RewardItem } from '@/types/feed'
import { Button } from '@/app/components/ui/Button';

// Type guard to check if an item has contributors
const hasContributors = (item: Item): item is FundingRequestItem | GrantItem | RewardItem => {
  return item.type === 'funding_request' || item.type === 'grant';
};

export const FeedItem: React.FC<{ entry: FeedEntry }> = ({ entry }) => {
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
          <div className="flex-shrink-0 mr-4">
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
                <span className="font-medium text-gray-900 hover:text-indigo-600 cursor-pointer">
                  {actor.fullName}
                </span>
              </ProfileTooltip>
              {actor.isVerified && (
                <BadgeCheck className={`h-4 w-4 ml-1 ${isBioRxiv ? 'text-yellow-500' : 'text-blue-500'}`} />
              )}
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
  
        <div className="p-4 rounded-lg border bg-gray-50">
          {item.type === 'paper' && (
            <Link href={`/paper/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`} className="block">
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
            </Link>
          )}
  
          {item.type === 'funding_request' && (
            <>
              <Link href={`/fund/${item.id}/${item.title.toLowerCase().replace(/ /g, '-')}`}>
                <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {item.description.length > 200 
                    ? `${item.description.slice(0, 200)}...` 
                    : item.description}
                </p>
              </Link>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">{item.amount} RSC raised</span>
                    <span className="text-sm text-gray-500">of {item.goalAmount} RSC goal</span>
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
                <Button variant="researchcoin" className="w-30 space-x-2">
                  <Coins className="h-4 w-4" />
                  <span>Contribute</span>
                </Button>
                {hasContributors(item) && item.contributors && (
                  <div className="flex items-center ml-4">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {item.contributors.slice(0, 3).map((contributor) => (
                          <div key={contributor.id} className="relative">
                            {contributor.profileImage ? (
                              <img 
                                src={contributor.profileImage}
                                alt={contributor.fullName}
                                className="h-8 w-8 rounded-full ring-2 ring-white object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center border border-gray-200">
                                <CircleUser className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <ProfileTooltip
                              type={contributor.isOrganization ? 'organization' : 'user'}
                              name={contributor.fullName}
                              headline={contributor.isOrganization ? 'Organization' : 'Researcher'}
                              verified={false}
                            >
                              <span className="sr-only">{contributor.fullName}</span>
                            </ProfileTooltip>
                          </div>
                        ))}
                        {item.contributors.length > 3 && (
                          <div className="relative h-8 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center ml-1">
                            +{item.contributors.length - 3} Others
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
  
          {item.type === 'grant' && (
            <>
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Amount: {item.amount}</span>
                {item.deadline && <span className="text-sm text-gray-500">Deadline: {item.deadline}</span>}
              </div>
            </>
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
                    <span className="text-orange-500 font-medium">{item.amount} RSC reward</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Due in {item.deadline}</span>
                  </div>
                </div>
                <div>
                  <Button variant="default" className="w-24">
                    Start
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Amount: {item.amount}</span>
                <span className="text-sm text-gray-500">Review Score: {item.metrics.reviewScore}</span>
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
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Amount: {item.amount}</span>
              </div>
            </>
          )}
        </div>
  
        <div className="mt-3 flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm">{item.metrics.votes}</span>
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{item.metrics.comments}</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Repeat2 className="h-4 w-4" />
            <span className="text-sm">{item.metrics.reposts || 0}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};