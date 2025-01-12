'use client'

import { useState } from 'react'
import { Button } from './Button'
import { AvatarStack } from './AvatarStack'
import { ContributorModal } from '../modals/ContributorModal'
import { AuthorProfile } from '@/types/user'
import { cn } from '@/utils/styles'

interface ContributorsButtonProps {
  contributors: Array<{
    profile: AuthorProfile
    amount: number
  }>
  onContribute?: () => void
  label?: string
}

export function ContributorsButton({ contributors, onContribute, label = 'Contributors' }: ContributorsButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const avatarItems = contributors.map(({ profile }) => ({
    src: profile.profileImage || '',
    alt: profile.fullName,
    tooltip: profile.fullName
  }))

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="hover:bg-gray-300 bg-gray-100 px-2 h-8 rounded-full flex items-center justify-center border border-gray-200"
        tooltip="View contributors"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center">
          <AvatarStack
            items={avatarItems}
            size="xxs"
            maxItems={2}
            spacing={-8}
            disableTooltip
          />
          <span className="text-xs text-gray-600 ml-1.5">
            {contributors.length} {label}
          </span>
        </div>
      </Button>

      <ContributorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contributors={contributors}
        onContribute={onContribute}
      />
    </>
  )
} 