'use client'

import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { X, Coins, Users2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons'

interface MarketplaceFundingBannerProps {
  onDismiss: () => void;
}

export const MarketplaceFundingBanner: React.FC<MarketplaceFundingBannerProps> = ({ onDismiss }) => {
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
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-5 mb-6 relative overflow-hidden">
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
              icon={faHandHoldingDollar} 
              className="h-5 w-5 mr-2"
            />
            Fund Open Science
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white/10 rounded-lg p-2">
                <Users2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Open Participation</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Anyone who cares about scientific progress can contribute RSC to fund research
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white/10 rounded-lg p-2">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Quadratic Funding</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Contributions are matched to maximize impact, giving greater weight to broad community support.
                  <Link 
                    href="/learn/quadratic-funding" 
                    className="inline-flex items-center text-white hover:text-white/90 font-medium ml-1 underline decoration-white/50 hover:decoration-white"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
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