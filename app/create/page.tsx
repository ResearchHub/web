'use client'

import { useRouter } from 'next/navigation'
import { FileUp, BadgeCheck, ArrowRight, PlusIcon, HandCoins } from 'lucide-react'
import { FundingIcon } from '@/components/ui/icons/FundingIcon'
import { CreatePageLayout } from '@/app/layouts/CreatePageLayout'

const CreationOption = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  comingSoon = false,
  iconSize = "w-6 h-6"
}: { 
  icon: any, 
  title: string, 
  description: string, 
  onClick?: () => void,
  comingSoon?: boolean,
  iconSize?: string
}) => (
  <button
    onClick={onClick}
    disabled={comingSoon}
    className={`
      w-full p-6 rounded-lg border border-gray-200 bg-white
      hover:border-gray-300 hover:shadow-sm hover:translate-x-1 transition-all duration-200
      flex items-start gap-4 text-left group relative
      ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <div className="flex-shrink-0">
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className={`${iconSize} text-blue-600`} />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
    <div className="flex-shrink-0 self-center ml-4">
      <ArrowRight className="w-5 h-5 text-gray-400" />
    </div>
  </button>
)

export default function CreatePage() {
  const router = useRouter()

  return (
    <CreatePageLayout
      title={
        <div className="flex items-center gap-2">
          <PlusIcon className="w-8 h-8 text-gray-900" />
          New
        </div>
      }
      description="Choose how you want to contribute to the scientific community"
      sidebarTitle="Let's accelerate science together"
      sidebarDescription="ResearchHub is an Open Science platform that incentivizes good scientific behavior"
      stats={[
        { number: "10,000+", label: "Researchers" },
        { number: "5,000+", label: "Papers Published" },
        { number: "$2M+", label: "In Funding" },
        { number: "3,000+", label: "Active Projects" }
      ]}
    >
      <div className="grid gap-6 pb-12">
        <div className="space-y-6">
          <CreationOption
            icon={FileUp}
            title="Submit your research"
            description="Submit your original research. Optionally publish in the ResearchHub Journal."
            onClick={() => router.push('/work/create')}
            iconSize="w-7 h-7"
          />
          
          <CreationOption
            icon={BadgeCheck}
            title="Claim paper"
            description="Claim ownership of your paper and earn ResearchCoin when it is cited."
            onClick={() => router.push('/work/claim')}
            iconSize="w-7 h-7"
          />

          <CreationOption
            icon={(props: { className?: string }) => <FundingIcon size={28} {...props} color="rgb(37, 99, 235)" />}
            title="Fund your research"
            description="Fund your research through a crowdfunding campaign."
            onClick={() => router.push('/funding/create')}
            iconSize="w-9 h-9"
          />
          
          <CreationOption
            icon={HandCoins}
            title="Open a grant"
            description="Fund promising research on ResearchHub."
            onClick={() => router.push('/grant/create')}
            iconSize="w-8 h-8"
          />
        </div>
      </div>
    </CreatePageLayout>
  )
} 