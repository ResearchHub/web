'use client'

import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { X, Coins, Users2 } from 'lucide-react'

export const MarketplaceBanner = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const bannerDismissed = localStorage.getItem('marketplaceBannerDismissed')
    if (!bannerDismissed) {
      setIsVisible(true)
    }
  }, [])

  const dismissBanner = () => {
    localStorage.setItem('marketplaceBannerDismissed', 'true')
    setIsVisible(false)
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
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 mb-6 relative overflow-hidden">
        <button
          onClick={dismissBanner}
          className="absolute top-3 right-3 text-white/80 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-4 text-center">
          How Funding Works
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-white/10 rounded-lg p-2.5">
              <Users2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white text-base mb-1">Open Participation</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Anyone who cares about scientific progress can contribute RSC to fund research
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-white/10 rounded-lg p-2.5">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white text-base mb-1">Quadratic Funding</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Contributions are matched to maximize impact, giving greater weight to broad community support
              </p>
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