'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    // Redirect to sign-in with the error parameter
    router.push(`/auth/signin?error=${error}`)
  }, [error, router])

  return null // This page won't render anything, it just redirects
} 