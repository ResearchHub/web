'use client'

import { useState } from 'react'
import { Transition } from '@headlessui/react'
import { X, Award, FileCheck } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'

interface MarketplaceRewardsBannerProps {
  onDismiss: () => void;
}

export const MarketplaceRewardsBanner: React.FC<MarketplaceRewardsBannerProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)

  const dismissBanner = () => {
    setIsVisible(false)
    onDismiss()
  }

  return (
    <Transition
      show={isVisible}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-md p-5 mb-6 relative overflow-hidden animate-gradient">
        <button
          onClick={dismissBanner}
          className="absolute top-3 right-3 text-white/80 hover:text-white z-10"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-[1]">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
            <FontAwesomeIcon 
              icon={faSeedling} 
              className="h-5 w-5 mr-2"
            />
            Earn ResearchCoin Rewards
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white/10 rounded-md p-2">
                <FileCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Peer Review</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Earn RSC by reviewing research papers and contributing to scientific validation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white/10 rounded-md p-2">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Science Actions</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Get rewarded for various scientific contributions and community participation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
      </div>
    </Transition>
  )
} 