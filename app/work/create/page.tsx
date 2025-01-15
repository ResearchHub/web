'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, BadgeCheck, BookOpen, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Search } from '@/components/Search/Search'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import type { SearchSuggestion } from '@/services/types/search.dto'

const Stat = ({ number, label }: { number: string, label: string }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
    <div className="text-2xl font-bold text-white">{number}</div>
    <div className="text-sm text-white/80">{label}</div>
  </div>
)

const PaperActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  badge,
}: { 
  icon: any, 
  title: string, 
  description: string, 
  onClick: () => void,
  badge?: string
}) => (
  <button
    onClick={onClick}
    className="w-full p-6 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all flex items-start gap-4 text-left group"
  >
    <div className="flex-shrink-0">
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
    <div className="flex-shrink-0 self-center ml-4">
      <ArrowRight className="w-5 h-5 text-gray-400" />
    </div>
  </button>
)

export default function WorkCreatePage() {
  const router = useRouter()
  const [selectedPaper, setSelectedPaper] = useState<SearchSuggestion | null>(null)
  
  // Check if we should show the NEW badge (before June 1st 2025)
  const showNewBadge = new Date() < new Date('2025-06-01')

  const handlePaperSelect = (paper: SearchSuggestion) => {
    setSelectedPaper(paper)
  }

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Submit your research
            </h1>
            <p className="text-xl text-gray-500 mb-12">
              Share your work with the scientific community
            </p>
          </div>

          {/* Search Section */}
          <div className="space-y-8 pb-12">
            {!selectedPaper ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Is your paper published elsewhere?
                </h2>
                <p className="text-gray-500 mb-6">
                  Search by DOI or title to find your published paper
                </p>
                
                <div className="space-y-6">
                  <Search 
                    displayMode="inline" 
                    showSuggestionsOnFocus={false}
                    className="w-full"
                    onSelect={handlePaperSelect}
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-500">or</span>
                    </div>
                  </div>

                  <div>
                    <Button
                      onClick={() => router.push('/work/create/new')}
                      variant="outlined"
                      className="w-full py-6 text-base"
                    >
                      I haven't published this paper yet
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    What would you like to do with this paper?
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Choose how you want to share your research on ResearchHub
                  </p>
                </div>

                <div className="space-y-4">
                  <PaperActionCard
                    icon={Eye}
                    title="View paper"
                    description="View paper on ResearchHub"
                    onClick={() => router.push(`/work/${selectedPaper.id}/${selectedPaper.slug}`)}
                  />
                  
                  <PaperActionCard
                    icon={BadgeCheck}
                    title="Claim paper"
                    description="Claim paper to earn ResearchCoin rewards"
                    onClick={() => router.push(`/work/${selectedPaper.id}/${selectedPaper.slug}/claim`)}
                  />
                  
                  <PaperActionCard
                    icon={BookOpen}
                    title="Publish in ResearchHub Journal"
                    description="Fast peer-reviewed publication with 14-day decision"
                    onClick={() => router.push(`/work/${selectedPaper.id}/${selectedPaper.slug}/publish`)}
                    badge={showNewBadge ? "NEW" : undefined}
                  />
                </div>

                <div>
                  <button
                    onClick={() => setSelectedPaper(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Search for a different paper
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[35%] relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute inset-0 [background:linear-gradient(135deg,rgba(37,99,235,0.85)_0%,rgba(59,130,246,0.75)_50%,rgba(96,165,250,0.80)_100%)] backdrop-blur-xl" />
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
    </div>
  )
} 