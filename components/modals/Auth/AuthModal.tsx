import { useState } from 'react'
import { X } from 'lucide-react'
import SelectProvider from './screens/SelectProvider'
import Login from './screens/Login'
import Signup from './screens/Signup'
import VerifyEmail from './screens/VerifyEmail'
import { AuthScreen } from './types'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [screen, setScreen] = useState<AuthScreen>('SELECT_PROVIDER')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const sharedProps = {
    onClose,
    email,
    setEmail,
    isLoading,
    setIsLoading,
    error,
    setError,
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {screen === 'SELECT_PROVIDER' && (
          <SelectProvider
            {...sharedProps}
            onContinue={() => setScreen('LOGIN')}
            onSignup={() => setScreen('SIGNUP')}
          />
        )}
        {screen === 'LOGIN' && (
          <Login
            {...sharedProps}
            onBack={() => setScreen('SELECT_PROVIDER')}
          />
        )}
        {screen === 'SIGNUP' && (
          <Signup
            {...sharedProps}
            onBack={() => setScreen('SELECT_PROVIDER')}
            onVerify={() => setScreen('VERIFY_EMAIL')}
          />
        )}
        {screen === 'VERIFY_EMAIL' && (
          <VerifyEmail {...sharedProps} />
        )}
      </div>
    </div>
  )
} 