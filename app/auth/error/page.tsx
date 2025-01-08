'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  useEffect(() => {
    // Redirect to sign-in with the error parameter
    router.push(`/auth/signin?error=${error ?? ''}`)
  }, [error, router])

  return null // This page won't render anything, it just redirects
}

export default function AuthError() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  )
} 