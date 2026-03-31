import { useFormContext } from 'react-hook-form';
import { Upload, Image as ImageIcon, Gift, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Switch } from '@/components/ui/Switch';
import Image from 'next/image';
import { cn } from '@/utils/styles';
import { useRef, useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { FundraiseSection } from '@/components/work/components/FundraiseSection';
import { NonprofitSearchSection } from '@/components/Nonprofit';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { useNonprofitSearch } from '@/hooks/useNonprofitSearch';
import { SelectFundingOpportunityModal } from '@/components/modals/SelectFundingOpportunityModal';
import { SelectedGrantData } from '@/components/Editor/lib/utils/publishingFormStorage';
import { formatCompactAmount } from '@/utils/currency';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';

interface FundingSectionProps {
  note: Note;
}

const FEATURE_FLAG_NFT_REWARDS = false;

function FundingOpportunitySection() {
  const { watch, setValue } = useFormContext();
  const selectedGrant: SelectedGrantData | null = watch('selectedGrant');
  const workId = watch('workId');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (workId) return null;

  return (
    <>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-gray-900 mb-2">
          Funding Opportunity <span className="font-normal text-gray-500 text-xs">(Optional)</span>
        </h3>
        {selectedGrant ? (
          <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 relative">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative">
              {selectedGrant.imageUrl ? (
                <Image
                  src={selectedGrant.imageUrl}
                  alt={selectedGrant.shortTitle}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {selectedGrant.organization || 'Funding Opportunity'}
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {selectedGrant.shortTitle}
              </div>
              <div className="text-xs font-medium text-emerald-600">
                {formatCompactAmount(selectedGrant.fundingAmount)} Funding
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue('selectedGrant', null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Select Funding Opportunity
          </button>
        )}
      </div>

      <SelectFundingOpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(grant) => setValue('selectedGrant', grant)}
      />
    </>
  );
}

export function FundingSection({ note }: Readonly<FundingSectionProps>) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const rewardFunders = watch('rewardFunders');
  const budget = watch('budget');
  const nftSupply = watch('nftSupply');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditingNonprofit, setIsEditingNonprofit] = useState(false);

  const fundraise = note.post?.fundraise;
  const {
    nonprofit,
    departmentLabName: existingNote,
    isLoading: isLoadingNonprofit,
  } = useNonprofitByFundraiseId(fundraise?.id);
  const { results: nonprofitSearchResults, searchNonprofits } = useNonprofitSearch();

  // If we have a fundraise and a nonprofit with EIN, search for complete data
  useEffect(() => {
    if (nonprofit?.ein && !isEditingNonprofit) {
      searchNonprofits(nonprofit.ein);
    }
  }, [nonprofit, searchNonprofits, isEditingNonprofit]);

  // When we have both the nonprofit from the fundraise and search results, merge the data
  // and set it in the form
  useEffect(() => {
    if (
      nonprofit &&
      nonprofitSearchResults &&
      nonprofitSearchResults.length > 0 &&
      !isEditingNonprofit
    ) {
      const matchedNonprofit = nonprofitSearchResults.find(
        (result) => result.ein === nonprofit.ein
      );

      if (matchedNonprofit) {
        const mergedNonprofit = {
          ...matchedNonprofit,
          id: nonprofit.id,
          endaomentOrgId: nonprofit.endaomentOrgId || matchedNonprofit.endaomentOrgId,
          baseWalletAddress: nonprofit.baseWalletAddress || matchedNonprofit.baseWalletAddress,
        };

        setValue('selectedNonprofit', mergedNonprofit);
        setValue('departmentLabName', existingNote);
      } else {
        setValue('selectedNonprofit', nonprofit);
        setValue('departmentLabName', existingNote);
      }
    } else if (nonprofit && !isEditingNonprofit) {
      setValue('selectedNonprofit', nonprofit);
      setValue('departmentLabName', existingNote);
    }
  }, [nonprofit, nonprofitSearchResults, existingNote, setValue, isEditingNonprofit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('nftArt', file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const formatNumberWithCommas = (value: string) => {
    const numericValue = value.replaceAll(/\D/g, '');
    return numericValue ? Number.parseInt(numericValue).toLocaleString() : '';
  };

  const calculateMinDonation = () => {
    const funding = Number.parseFloat(budget?.replaceAll(/[^0-9.]/g, '') || '0');
    const supply = Number.parseInt(nftSupply?.replaceAll(/\D/g, '') || '0');
    if (!funding || !supply) return '0.00';
    return (funding / supply).toFixed(2);
  };

  return (
    <div className="py-3 px-6 space-y-6">
      <FundingOpportunitySection />

      {fundraise ? (
        <>
          <FundraiseSection fundraise={fundraise} />
          <div className="pt-4 border-t border-gray-200">
            {isLoadingNonprofit && (
              <p className="text-sm text-gray-500 px-1">Loading nonprofit information...</p>
            )}
            {!isLoadingNonprofit && (isEditingNonprofit || !nonprofit) && (
              <NonprofitSearchSection />
            )}
            {!isLoadingNonprofit && !isEditingNonprofit && nonprofit && (
              <NonprofitSearchSection
                readOnly={false}
                allowClear={true}
                onClear={() => setIsEditingNonprofit(true)}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <Input
              {...register('budget')}
              label="Funding Goal"
              required
              placeholder="1,000"
              type="text"
              inputMode="numeric"
              className="w-full"
              error={errors.budget?.message?.toString()}
              rightElement={
                <div className="flex items-center pr-4 font-medium text-sm text-gray-900">USD</div>
              }
              helperText="Set your total funding goal for this research project"
              onChange={(e) => {
                const numericValue = e.target.value.replaceAll(/\D/g, '');
                setValue('budget', numericValue, { shouldValidate: true });

                if (numericValue) {
                  e.target.value = new Intl.NumberFormat('en-US').format(
                    Number.parseInt(numericValue)
                  );
                } else {
                  e.target.value = '';
                }
              }}
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <NonprofitSearchSection />
          </div>
        </>
      )}

      {FEATURE_FLAG_NFT_REWARDS && (
        <>
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-gray-700" />
                <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">
                  Reward Funders
                </h3>
              </div>
              <Switch
                checked={rewardFunders}
                onCheckedChange={(checked) => setValue('rewardFunders', checked)}
              />
            </div>
            <p className="text-sm text-gray-600">
              Reward your funders with a memento of your research as an NFT.
            </p>
          </div>
          {rewardFunders && (
            <>
              NFT Art Upload Section
              <div className="pt-2">
                <span className="block text-sm font-medium text-gray-900 mb-2">NFT Art</span>
                <Button
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative w-full h-auto aspect-[4/2] rounded-xl border-2 border-dashed p-0',
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
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              NFT Supply Section
              <div>
                <Input
                  {...register('nftSupply')}
                  label="NFT Supply"
                  required
                  placeholder="1000"
                  type="text"
                  inputMode="numeric"
                  className="w-full"
                  helperText="The number of NFTs you are offering to funders"
                  onChange={(e) => {
                    const formatted = formatNumberWithCommas(e.target.value);
                    setValue('nftSupply', formatted, { shouldValidate: true });
                  }}
                />
              </div>
              Donation Rewards Section
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-gray-700" />
                  <span className="block text-sm font-medium text-gray-900">Donation Rewards</span>
                </div>
                <div className="relative bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={
                      Number.parseFloat(calculateMinDonation()) > 0
                        ? `$${calculateMinDonation()} per NFT`
                        : '-'
                    }
                    className="w-full pl-3 pr-12 py-2 text-sm text-gray-900 bg-transparent border-0 cursor-default focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  {Number.parseFloat(calculateMinDonation()) > 0
                    ? `Funders must donate at least $${calculateMinDonation()} USD to receive one research memento NFT`
                    : 'Set a funding goal and NFT supply to calculate the minimum donation per NFT'}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
