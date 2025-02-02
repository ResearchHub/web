'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Target,
  Beaker,
  Rocket,
  Users,
  FileText,
  ClipboardCheck,
  Coins,
  User2,
  UserPlus,
  Clock,
  HelpCircle,
  GraduationCap,
  CircleDollarSign,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Switch } from '@/components/ui/Switch';
import Image from 'next/image';
import { PostService } from '@/services/post.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { usePreregistrationPost } from '@/hooks/useDocument';

export interface FormData {
  title: string;
  background: string;
  hypothesis: string;
  methods: string;
  budget: string;
  budgetUse: string;
  rewardFunders: boolean;
  nftArt: File | null;
  nftSupply: string;
}

export default function FundingCreatePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    background: '',
    hypothesis: '',
    methods: '',
    budget: '',
    budgetUse: '',
    rewardFunders: false,
    nftArt: null as File | null,
    nftSupply: '1000',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [{ error, isLoading }, createPreregistrationPost] = usePreregistrationPost();

  const pricePerNFT = useMemo(() => {
    if (!formData.budget || !formData.nftSupply) return 0;
    const budget = parseFloat(formData.budget.replace(/[^0-9.]/g, ''));
    const supply = parseInt(formData.nftSupply.replace(/[^0-9]/g, ''));
    return budget && supply ? budget / supply : 0;
  }, [formData.budget, formData.nftSupply]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await createPreregistrationPost(formData);

      router.push(`/fund/${response.id}/${response.slug}`);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const rightSidebar = (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-semibold text-blue-600">$2M+</div>
          <div className="text-sm text-gray-600 mt-1">Total Funding</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-semibold text-blue-600">500+</div>
          <div className="text-sm text-gray-600 mt-1">Projects Funded</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-semibold text-blue-600">10k+</div>
          <div className="text-sm text-gray-600 mt-1">NFTs Minted</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-semibold text-blue-600">5k+</div>
          <div className="text-sm text-gray-600 mt-1">Researchers</div>
        </div>
      </div>

      <CollapsibleSection
        title="Frequently Asked Questions"
        icon={<HelpCircle className="w-4 h-4 text-gray-900" />}
      >
        <CollapsibleItem
          title="Who is eligible?"
          isOpen={openSections.includes('eligibility')}
          onToggle={() => toggleSection('eligibility')}
        >
          <p>Anyone who has an idea for a cost effective project</p>
        </CollapsibleItem>

        <CollapsibleItem
          title="What happens if funding goal isn't met?"
          isOpen={openSections.includes('protection')}
          onToggle={() => toggleSection('protection')}
        >
          <p>
            If your experiment does not reach its funding goal, all contributions will be returned
            to the funders in full.
          </p>
        </CollapsibleItem>

        <CollapsibleItem
          title="What are the criteria for funding?"
          isOpen={openSections.includes('criteria')}
          onToggle={() => toggleSection('criteria')}
        >
          <ul className="list-disc pl-4 space-y-1">
            <li>Studies must be feasible to complete in under 1.5 years</li>
            <li>
              Studies must have a definitive endpoint that can result in a publishable unit of work
            </li>
            <li>Applications are not limited to a specific domain of research</li>
          </ul>
        </CollapsibleItem>

        <CollapsibleItem
          title="How will this be funded?"
          isOpen={openSections.includes('funding')}
          onToggle={() => toggleSection('funding')}
        >
          <ul className="list-disc pl-4 space-y-2">
            <li>
              A panel of multi-disciplinary scientists will make funding decisions based on a
              blinded screening of proposals
            </li>
            <li>
              Proposals will undergo screening to verify the capability of the applicant to perform
              experiments
            </li>
            <li>
              Once selected, winning proposals will expand their projects into a Pre-Registration to
              go live on our Funding page to raise crowdfunding from ResearchHub users
            </li>
          </ul>
          <p className="mt-2 text-xs italic">
            Note: The ResearchHub Foundation will provide 1-on-1 direct assistance with this process
            for any applicants who would like it.
          </p>
        </CollapsibleItem>

        <CollapsibleItem
          title="What are the conditions?"
          isOpen={openSections.includes('conditions')}
          onToggle={() => toggleSection('conditions')}
        >
          <ul className="list-disc pl-4 space-y-2">
            <li>
              Applications that are chosen for crowdfunding will have an open line of communication
              with members of the ResearchHub staff and are expected to respond to infrequent
              progress inquiries and updates in a timely manner
            </li>
            <li>Awardees should provide a brief (1-paragraph) progress update each month</li>
          </ul>
        </CollapsibleItem>
      </CollapsibleSection>
    </div>
  );

  return (
    <PageLayout rightSidebar={rightSidebar}>
      <div className="relative">
        <div className="relative">
          {/* Header with icon */}
          <div className="flex items-center gap-4 mb-4">
            <PageHeader title="Fund your Research" className="mb-0" />
          </div>
          <p className="text-base text-gray-600 text-lg">
            Launch a crowdfunding campaign and bring your research to life.
          </p>

          {/* Process Steps */}
          <div className="space-y-4 mt-8 mb-12">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-semibold text-gray-900">Funding Timeline</h2>
            </div>
            <div className="grid grid-cols-[1fr,auto,1fr,auto,1fr] items-center gap-4">
              <div className="bg-white/80 backdrop-blur rounded-xl border-2 border-blue-200 p-4 shadow-sm h-[140px] flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Submit Preregistration</div>
                    <p className="text-xs text-gray-500 mt-2">
                      Describe your study. Once form submitted, the preregistration will receive a
                      DOI and be made live on ResearchHub.
                    </p>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-gray-500" />

              <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-200 p-4 h-[140px] flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Editorial Review</div>
                    <p className="text-xs text-gray-500 mt-2">
                      Our editorial team will review your preregistration and determine if it meets
                      our criteria for crowdfunding.
                    </p>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-gray-500" />

              <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-200 p-4 h-[140px] flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <Coins className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Crowdfund Campaign</div>
                    <p className="text-xs text-gray-500 mt-2">
                      Your campaign goes live and the community can start funding your research.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-200 p-8">
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
                      <div className="flex items-center pr-4 font-semibold text-gray-700">USD</div>
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
                    <div className="flex justify-center">
                      <div className="bg-gray-100 rounded-full p-3">
                        <UserPlus className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="text-gray-600">
                      No authors added yet. Click the button below to add authors and their
                      affiliations.
                    </div>
                    <Button variant="outlined">+ Add author</Button>
                  </div>
                </div>

                {/* Acknowledge your funders */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Acknowledge your funders
                      </h2>
                      <Switch
                        checked={formData.rewardFunders}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, rewardFunders: checked }))
                        }
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
                              <div className="text-xs mt-1">
                                This can be a graphical abstract, a figure in the paper or something
                                else
                              </div>
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
                        helperText="The number of NFTs you are offering to funders"
                      />

                      {pricePerNFT > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Based on your budget of ${formData.budget} and supply of{' '}
                            {formData.nftSupply} NFTs, funders contributing $
                            {pricePerNFT.toFixed(2)} USD will receive an acknowledgement NFT in
                            return.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-12">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full py-6 text-lg"
                  variant={submitting ? 'start-task' : undefined}
                >
                  Submit for Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
