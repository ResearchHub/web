'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/form/Input'
import { Textarea } from '@/components/ui/form/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Switch } from '@/components/ui/Switch'
import Image from 'next/image'
import { CreatePageLayout } from '@/app/layouts/CreatePageLayout'

export default function FundingCreatePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    background: '',
    hypothesis: '',
    methods: '',
    budget: '',
    budgetUse: '',
    rewardFunders: true,
    nftArt: null as File | null,
    nftSupply: '1000',
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const pricePerNFT = useMemo(() => {
    if (!formData.budget || !formData.nftSupply) return 0
    const budget = parseFloat(formData.budget.replace(/[^0-9.]/g, ''))
    const supply = parseInt(formData.nftSupply.replace(/[^0-9]/g, ''))
    return budget && supply ? budget / supply : 0
  }, [formData.budget, formData.nftSupply])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Format numbers with commas for display
    if (name === 'budget' || name === 'nftSupply') {
      // Remove any non-digit characters from the input
      const numericValue = value.replace(/[^0-9]/g, '')
      // Format with commas
      const formattedValue = numericValue ? parseInt(numericValue).toLocaleString() : ''
      setFormData(prev => ({ ...prev, [name]: formattedValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, nftArt: file }))
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement submission logic
    console.log('Form submitted:', formData)
  }

  return (
    <CreatePageLayout
      title="Fund your Research"
      description="Fund your research through a crowdfund campaign"
      sidebarTitle="Fund your research with NFTs"
      sidebarDescription="Create a crowdfunding campaign to fund your research and build a community around your work"
      stats={[
        { number: "$2M+", label: "Total Funding" },
        { number: "500+", label: "Projects Funded" },
        { number: "10k+", label: "NFTs Minted" },
        { number: "5k+", label: "Researchers" }
      ]}
    >
      <form onSubmit={handleSubmit} className="pb-12">
        <div className="space-y-12">
          {/* Study Information */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900">Study Information</h2>
            
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              label="Title"
              required
              placeholder="Title of your research"
              className="w-full"
            />

            <Textarea
              name="background"
              value={formData.background}
              onChange={handleInputChange}
              label="Background"
              required
              placeholder="Explain the significance of this research"
              className="w-full"
            />

            <Input
              name="hypothesis"
              value={formData.hypothesis}
              onChange={handleInputChange}
              label="Hypothesis"
              required
              placeholder="What hypothesis are you testing?"
              className="w-full"
            />

            <Textarea
              name="methods"
              value={formData.methods}
              onChange={handleInputChange}
              label="Experimental Methods"
              required
              placeholder="Describe your experimental methods in detail"
              className="w-full"
            />

            <Input
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              label="Budget"
              required
              placeholder="How much money are you looking to raise?"
              type="text"
              inputMode="numeric"
              className="w-full"
              rightElement={
                <div className="flex items-center pr-4 font-semibold text-gray-700">
                  USD
                </div>
              }
            />

            <Textarea
              name="budgetUse"
              value={formData.budgetUse}
              onChange={handleInputChange}
              label="What will you use these funds for?"
              required
              placeholder="What will you use these funds for?"
              className="w-full"
            />
          </div>

          {/* Authors Section */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900">Authors</h2>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center space-y-4">
              <div className="text-gray-600">
                No authors added yet. Click the button below to add authors and their affiliations.
              </div>
              <Button variant="outlined">
                + Add author
              </Button>
            </div>
          </div>

          {/* Acknowledge your funders */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Acknowledge your funders</h2>
                <Switch
                  checked={formData.rewardFunders}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rewardFunders: checked }))}
                />
              </div>
              <p className="text-base text-gray-600">
                Reward your funders through an NFT memento of your research.
              </p>
            </div>

            {formData.rewardFunders && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Art
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative w-full aspect-[3/2] rounded-xl border-2 border-dashed
                      transition-all cursor-pointer group
                      ${previewUrl ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'}
                    `}
                  >
                    {previewUrl ? (
                      <>
                        <Image
                          src={previewUrl}
                          alt="NFT Preview"
                          fill
                          className="object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <div className="text-white text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <span>Change Image</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <div className="text-sm font-medium">Click to upload</div>
                        <div className="text-xs mt-1">This can be a graphical abstract, a figure in the paper or something else</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <Input
                  name="nftSupply"
                  value={formData.nftSupply}
                  onChange={handleInputChange}
                  label="NFT Supply"
                  required
                  placeholder="NFT Supply"
                  type="text"
                  inputMode="numeric"
                  className="w-full"
                  defaultValue="1000"
                  helperText='The number of NFTs you are offering to funders'
                />

                {pricePerNFT > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Based on your budget of ${formData.budget} and supply of {formData.nftSupply} NFTs, 
                      funders contributing ${pricePerNFT.toFixed(2)} USD will receive an acknowledgement NFT in return.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-12">
          <Button type="submit" size="lg" className="w-full py-6 text-lg">
            Submit for Review
          </Button>
        </div>
      </form>
    </CreatePageLayout>
  )
} 