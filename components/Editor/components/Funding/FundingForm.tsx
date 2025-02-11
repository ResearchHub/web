'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Wallet, Gift } from 'lucide-react';
import { Input } from '@/components/ui/form/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Switch } from '@/components/ui/Switch';
import Image from 'next/image';
import { cn } from '@/utils/styles';

export interface FundingFormData {
  budget: string;
  rewardFunders: boolean;
  nftArt: File | null;
  nftSupply: string;
}

export interface FundingFormProps {
  onSubmit: (data: FundingFormData) => void;
  initialData?: Partial<FundingFormData>;
  className?: string;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export function FundingForm({
  onSubmit,
  initialData,
  className,
  showSubmitButton = false,
  submitButtonText = 'Submit',
  isSubmitting = false,
  error = null,
}: FundingFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FundingFormData>({
    budget: initialData?.budget || '',
    rewardFunders: initialData?.rewardFunders || false,
    nftArt: initialData?.nftArt || null,
    nftSupply: initialData?.nftSupply || '1000',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format numbers with commas for display
    if (name === 'budget' || name === 'nftSupply') {
      // Remove any non-digit characters from the input
      const numericValue = value.replace(/[^0-9]/g, '');
      // Format with commas
      const formattedValue = numericValue ? parseInt(numericValue).toLocaleString() : '';
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, nftArt: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateMinDonation = () => {
    const funding = parseFloat(formData.budget.replace(/[^0-9.]/g, ''));
    const supply = parseInt(formData.nftSupply.replace(/[^0-9]/g, ''));
    if (!funding || !supply) return '0.00';
    return (funding / supply).toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div>
        <Input
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
          label="Funding Goal"
          required
          placeholder="0.00"
          type="text"
          inputMode="numeric"
          className="w-full"
          rightElement={
            <div className="flex items-center pr-4 font-medium text-sm text-gray-900">USD</div>
          }
          helperText="Set your total funding goal for this research project"
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-gray-700" />
            <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">
              Reward Funders
            </h3>
          </div>
          <Switch
            checked={formData.rewardFunders}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, rewardFunders: checked }))
            }
          />
        </div>
        <p className="text-sm text-gray-600">
          Reward your funders with a free memento of your research as an NFT.
        </p>
      </div>

      {formData.rewardFunders && (
        <>
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">NFT Art</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative w-full aspect-[4/2] rounded-xl border-2 border-dashed',
                'transition-all cursor-pointer group',
                previewUrl ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'
              )}
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
                      <span className="text-sm font-medium">Change Image</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                  <div className="text-sm font-medium text-gray-700">Click to upload</div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              This can be a graphical abstract, a figure in the paper or something else
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <Input
              name="nftSupply"
              value={formData.nftSupply}
              onChange={handleInputChange}
              label="NFT Supply"
              required
              placeholder="1000"
              type="text"
              inputMode="numeric"
              className="w-full"
              helperText="The number of NFTs you are offering to funders"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-gray-700" />
              <label className="block text-sm font-medium text-gray-900">Donation Rewards</label>
            </div>
            <div className="relative bg-gray-50 rounded-lg">
              <input
                type="text"
                readOnly
                disabled
                value={
                  parseFloat(calculateMinDonation()) > 0
                    ? `$${calculateMinDonation()} per NFT`
                    : '-'
                }
                className="w-full pl-3 pr-12 py-2 text-sm text-gray-900 bg-transparent border-0 cursor-default focus:outline-none focus:ring-0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"></div>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {parseFloat(calculateMinDonation()) > 0
                ? `Funders must donate at least $${calculateMinDonation()} USD to receive one research memento NFT`
                : 'Set a funding goal and NFT supply to calculate the minimum donation per NFT'}
            </p>
          </div>
        </>
      )}

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      {showSubmitButton && (
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </Button>
      )}
    </form>
  );
}
