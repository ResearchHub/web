'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, FileUp, BadgeCheck, ArrowRight, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import { FundingIcon } from '@/components/ui/icons/FundingIcon'
import { GrantIcon } from '@/components/ui/icons/GrantIcon'

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
      w-full p-6 rounded-lg border border-gray-400 bg-white
      hover:bg-gray-100 hover:shadow-sm transition-all
      flex items-center gap-6 text-left group relative
      ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <div className="flex-1">
      <div className="flex items-center gap-4 mb-1">
        <Icon className={`${iconSize} text-black flex-shrink-0`} color="black" />
        <h3 className="text-[18px] font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-[16px] mt-2 text-gray-900">{description}</p>
    </div>
    <div className="flex-shrink-0 self-center">
      <ArrowRight className="w-5 h-5 text-black" />
    </div>
  </button>
)

const Stat = ({ number, label }: { number: string, label: string }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
    <div className="text-2xl font-bold text-white">{number}</div>
    <div className="text-sm text-white/80">{label}</div>
  </div>
)

export default function CreatePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <button
            onClick={() => router.back()}
            className="fixed top-8 left-8 inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Hero Section */}
          <div className="max-w-2xl pt-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {/* todo add plus icon */}
                <PlusIcon className="w-8 h-8 text-gray-900" />
              New
            </h1>
            <p className="text-xl text-gray-500 mb-12">
              Choose how you want to contribute to the scientific community
            </p>
          </div>

          {/* Creation Options */}
          <div className="grid gap-6 pb-12">
            <div className="space-y-6">
              <CreationOption
                icon={FileUp}
                title="Submit your research"
                description="Submit your original research. Optionally publish in the ResearchHub Journal."
                onClick={() => router.push('/work/submit')}
                iconSize="w-5 h-5"
              />
              
              <CreationOption
                icon={BadgeCheck}
                title="Claim paper"
                description="Claim ownership of your paper and earn ResearchCoin when it is cited."
                onClick={() => router.push('/work/claim')}
                iconSize="w-5 h-5"
              />

              <CreationOption
                icon={FundingIcon}
                title="Request funding"
                description="Request funding on your research by submitting a preregistration."
                onClick={() => router.push('/funding/request')}
                iconSize="w-8 h-8"
              />
              
              <CreationOption
                icon={GrantIcon}
                title="Submit grant"
                description="Fund promising research on ResearchHub."
                onClick={() => router.push('/grants/create')}
                iconSize="w-8 h-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[35%] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 [background:linear-gradient(135deg,rgba(79,70,229,0.85)_0%,rgba(147,51,234,0.75)_50%,rgba(168,85,247,0.80)_100%)] backdrop-blur-xl" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[100px]" />
        <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-t from-transparent via-white/5 to-white/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
        
        {/* Content */}
        <div className="relative z-10 p-12">
          <h2 className="text-3xl font-bold text-white leading-tight backdrop-blur-sm">
            Let's accelerate science together
          </h2>
          <p className="mt-4 text-lg text-white/90 backdrop-blur-sm">
            ResearchHub is an Open Science platform that incentivizes good scientific behavior
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <Stat number="10,000+" label="Researchers" />
            <Stat number="5,000+" label="Papers Published" />
            <Stat number="$2M+" label="In Funding" />
            <Stat number="3,000+" label="Active Projects" />
          </div>
        </div>
        
        {/* Logo Circle */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative w-[400px] h-[400px] rounded-full border-[10px] border-white/20 animate-pulse-slow backdrop-blur-sm">
            <Image
              src="/logo_white_no_text.png"
              alt=""
              layout="fill"
              objectFit="contain"
              className="opacity-25 scale-75"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Add these styles to your global CSS
const styles = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
` 