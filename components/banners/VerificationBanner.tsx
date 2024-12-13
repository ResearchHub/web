'use client'

import { X, BadgeCheck } from 'lucide-react'

interface VerificationBannerProps {
  onClose: () => void
}

export default function VerificationBanner({ onClose }: VerificationBannerProps) {
  return (
    <div className="bg-indigo-50 p-4 rounded-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <BadgeCheck className="h-5 w-5 text-gray-900 mr-2" />
            <h3 className="font-semibold text-gray-900">Verify & Unlock Perks</h3>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Auto sync all of your papers
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Get a verified badge
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Fast track your earnings
            </li>
          </ul>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-indigo-100 rounded-lg text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
} 