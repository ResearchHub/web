'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/form/Input'
import { Textarea } from '@/components/ui/form/Textarea'
import { Button } from '@/components/ui/Button'
import { CreatePageLayout } from '@/app/layouts/CreatePageLayout'

type ContactMethod = 'email' | 'phone' | null

export default function GrantCreatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    experiments: '',
    budget: '',
    email: '',
    phone: '',
  })
  const [contactMethod, setContactMethod] = useState<ContactMethod>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Format numbers with commas for display
    if (name === 'budget') {
      // Remove any non-digit characters from the input
      const numericValue = value.replace(/[^0-9]/g, '')
      // Format with commas
      const formattedValue = numericValue ? parseInt(numericValue).toLocaleString() : ''
      setFormData(prev => ({ ...prev, [name]: formattedValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement submission logic
    console.log('Form submitted:', formData)
  }

  return (
    <CreatePageLayout
      title="Open a Grant"
      description="Fund breakthrough research shaping tomorrow"
      sidebarTitle="Fund Research with Grants"
      sidebarDescription="Support innovative research projects and help advance scientific discovery"
      stats={[
        { number: "$2M+", label: "Total Grants" },
        { number: "500+", label: "Projects Funded" },
        { number: "10k+", label: "Researchers" },
        { number: "5k+", label: "Active Grants" }
      ]}
    >
      <form onSubmit={handleSubmit} className="pb-12">
        <div className="space-y-12">
          <div className="space-y-8">
            <Textarea
              name="experiments"
              value={formData.experiments}
              onChange={handleInputChange}
              label="What kind of experiments are you interested in funding?"
              required
              placeholder="Describe the types of experiments you wish to fund"
              className="w-full"
            />

            <Input
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              label="Budget"
              required
              placeholder="Amount for funding experiments"
              type="text"
              inputMode="numeric"
              className="w-full"
              rightElement={
                <div className="flex items-center pr-4 font-semibold text-gray-700">
                  USD
                </div>
              }
            />

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                How can we best reach you?
              </label>
              
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant={contactMethod === 'email' ? 'default' : 'outlined'}
                  onClick={() => setContactMethod('email')}
                  className="flex-1"
                >
                  Email
                </Button>
                <Button
                  type="button"
                  variant={contactMethod === 'phone' ? 'default' : 'outlined'}
                  onClick={() => setContactMethod('phone')}
                  className="flex-1"
                >
                  Phone
                </Button>
              </div>

              {contactMethod === 'email' && (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  type="email"
                  required
                  className="w-full"
                />
              )}

              {contactMethod === 'phone' && (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  type="tel"
                  required
                  className="w-full"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Button type="submit" size="lg" className="w-full py-6 text-lg">
            Submit for review
          </Button>
        </div>
      </form>
    </CreatePageLayout>
  )
} 