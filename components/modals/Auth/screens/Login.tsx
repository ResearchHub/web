import { useState } from 'react'
import { AuthService } from '@/services/auth'
import { ApiError } from '@/services/types'
import { BaseScreenProps } from '../types'

interface Props extends BaseScreenProps {
  onBack: () => void
}

export default function Login({
  onClose,
  email,
  isLoading,
  setIsLoading,
  error,
  setError,
  onBack,
}: Props) {
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await AuthService.login({ email, password })
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Welcome back</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          className="w-full p-3 border rounded mb-4 bg-gray-50"
          disabled
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          autoFocus
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="w-full text-gray-600 hover:text-gray-800"
      >
        ← Back
      </button>
    </div>
  )
} 