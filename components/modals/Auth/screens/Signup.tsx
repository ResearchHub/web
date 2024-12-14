import { useState } from 'react'
import { AuthService } from '@/services/auth.service'
import { ApiError } from '@/services/types/api'
import { BaseScreenProps } from '../types'

interface Props extends BaseScreenProps {
  onBack: () => void
  onVerify: () => void
}

export default function Signup({
  onClose,
  email,
  isLoading,
  setIsLoading,
  error,
  setError,
  onBack,
  onVerify,
}: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await AuthService.register({
        email,
        password1: password,
        password2: confirmPassword,
        first_name: firstName,
        last_name: lastName,
      })
      onVerify()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Create your account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name"
            className="p-3 border rounded"
          />
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last name"
            className="p-3 border rounded"
          />
        </div>

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
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full p-3 border rounded mb-4"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
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