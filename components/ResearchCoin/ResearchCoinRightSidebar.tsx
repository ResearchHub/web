'use client'

import { useState } from 'react'
import { 
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Route,
  HandCoins,
  Coins,
  Microscope,
  ArrowBigUpDash,
  CircleDollarSign,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  Scale,
} from 'lucide-react'
import { colors } from '@/app/styles/colors'

export const ResearchCoinRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? []
        : [section]
    )
  }

  return (
    <div className="w-80 fixed top-[64px] right-0 h-[calc(100vh-64px)] bg-white/95 backdrop-blur-md border-l border-gray-100">
      <div className="h-full overflow-y-auto pb-16 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {/* About Section */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3 mt-2">
            <GraduationCap className="h-5 w-5 text-primary-400" strokeWidth={2} />
            <h2 className="text-base font-semibold text-gray-900">About ResearchCoin</h2>
          </div>
          <div className="space-y-1 pl-4">
            {/* What is ResearchCoin */}
            <div className="group">
              <button 
                onClick={() => toggleSection('what-is-rsc')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Coins className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2}/>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    What is ResearchCoin (RSC)?
                  </span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('what-is-rsc') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('what-is-rsc') && (
                <div className={`pl-6 py-3 text-sm text-gray-600 border-l border-gray-100`}>
                  ResearchCoin (RSC) is a digital currency that incentivizes good science by allowing users to create grants, reward quality contributions, and fund open science initiatives on ResearchHub.
                </div>
              )}
            </div>

            {/* Why RSC */}
            <div className="group">
              <button 
                onClick={() => toggleSection('why-rsc')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2}/>
                  <span className={`text-sm text-gray-600 group-hover:text-gray-900 transition-colors`}>
                    Why RSC?
                  </span>
                </div>
                <div className={`text-gray-600 group-hover:text-gray-600 transition-colors`}>
                  {openSections.includes('why-rsc') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('why-rsc') && (
                <div className={`pl-6 py-3 text-sm text-gray-600 border-l border-gray-100`}>
                  RSC creates a transparent, merit-based ecosystem where researchers can be directly rewarded for their contributions to science. It helps bridge the gap between valuable research work and financial recognition.
                </div>
              )}
            </div>

            {/* Getting Started */}
            <div className="group">
              <button 
                onClick={() => toggleSection('getting-started')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Route className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className={`text-sm text-gray-600 group-hover:text-gray-900 transition-colors`}>
                    Getting Started with RSC
                  </span>
                </div>
                <div className={`text-gray-600 group-hover:text-gray-600 transition-colors`}>
                  {openSections.includes('getting-started') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('getting-started') && (
                <div className={`pl-6 py-3 text-sm text-gray-600 border-l border-gray-100`}>
                  To begin with ResearchCoin:
                  <ul className="mt-2 space-y-1.5">
                    <li>1. Create a ResearchHub account</li>
                    <li>2. Verify your academic credentials</li>
                    <li>3. Start engaging with content through reviews and discussions</li>
                    <li>4. Earn your first RSC through participation</li>
                    <li>5. Explore rewards and funding opportunities</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RSC Utility Section */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className={`h-5 w-5 text-[${colors.primary[400]}]`} strokeWidth={2} />
            <h2 className={`text-base font-semibold text-[${colors.gray[900]}]`}>Using ResearchCoin</h2>
          </div>
          <div className="space-y-1 pl-4">
            {/* Create Reward */}
            <div className="group">
              <button 
                onClick={() => toggleSection('create-reward')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2}/>
                  <span className={`text-sm text-gray-600 group-hover:text-gray-900 transition-colors`}>
                    Create reward
                  </span>
                </div>
                <div className={`text-gray-600 group-hover:text-gray-600 transition-colors`}>
                  {openSections.includes('create-reward') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('create-reward') && (
                <div className={`pl-6 py-3 text-sm text-gray-600 border-l border-gray-100`}>
                  RSC empowers the reward system on ResearchHub, connecting researchers with tailored opportunities. Users can create rewards to engage experts for tasks like data processing and literature reviews.
                </div>
              )}
            </div>

            {/* Fund Open Science */}
            <div className="group">
              <button 
                onClick={() => toggleSection('fund-science')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CircleDollarSign className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Fund open science
                  </span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('fund-science') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('fund-science') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  RSC enables the community to fund scientific projects through preregistrations, streamlining the proposal and funding process.
                </div>
              )}
            </div>

            {/* Tip Authors */}
            <div className="group">
              <button 
                onClick={() => toggleSection('tip-authors')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HandCoins className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Tip authors</span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('tip-authors') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('tip-authors') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  RSC incentivizes actions in the ResearchHub ecosystem, providing targeted rewards for individual contributions and broader research goals.
                </div>
              )}
            </div>

            {/* Governance */}
            <div className="group">
              <button 
                onClick={() => toggleSection('governance')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Change the platform</span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('governance') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('governance') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  RSC puts governance in the hands of researchers, allowing them to collectively shape the incentive structures in their fields. Through voting and proposal mechanisms, the research community can determine how to best reward different types of contributions.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earning Section */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3 mt-2">
            <Trophy className={`h-5 w-5 text-[${colors.primary[400]}]`} strokeWidth={2} />
            <h2 className={`text-base font-semibold text-[${colors.gray[900]}]`}>Earning ResearchCoin</h2>
          </div>
          <div className="space-y-1 pl-4">
            {/* Peer Review */}
            <div className="group">
              <button 
                onClick={() => toggleSection('peer-review')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Share a peer review</span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('peer-review') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('peer-review') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  Researchers earn RSC by peer reviewing preprints on ResearchHub. After verifying identity, peer review opportunities will be surfaced.
                </div>
              )}
            </div>

            {/* Answer Reward */}
            <div className="group">
              <button 
                onClick={() => toggleSection('answer-reward')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Answer a reward</span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('answer-reward') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('answer-reward') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  Researchers earn RSC by answering rewards on ResearchHub, from peer reviews to specialized research assistance, allowing monetization of expertise.
                </div>
              )}
            </div>

            {/* Reproducible Research */}
            <div className="group">
              <button 
                onClick={() => toggleSection('reproducible-research')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Microscope className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Do reproducible research</span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('reproducible-research') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('reproducible-research') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  Authors earn RSC on their published papers, earning multipliers for open science practices to promote transparency and reproducibility in research.
                  <br />• (Required): Open access
                  <br />• 2x: Has open data
                  <br />• 3x: Was preregistered
                </div>
              )}
            </div>

            {/* Get Upvotes */}
            <div className="group">
              <button 
                onClick={() => toggleSection('upvotes')}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowBigUpDash className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" strokeWidth={2} />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Get upvotes on your content</span>
                </div>
                <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
                  {openSections.includes('upvotes') ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </button>
              {openSections.includes('upvotes') && (
                <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">
                  Researchers earn RSC by receiving upvotes on their contributions to open scientific discourse, incentivizing critical discussions and informal exchanges.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  )
} 