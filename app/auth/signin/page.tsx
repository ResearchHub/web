'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthModal from '@/components/modals/Auth/AuthModal'

export default function SignIn() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      setIsModalOpen(true)
    }
  }, [error])

  return (
    <AuthModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      initialError={error}
    />
  )
} 