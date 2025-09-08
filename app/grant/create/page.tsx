'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Textarea } from '@/components/ui/form/Textarea';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import {
  DollarSign,
  CalendarDays,
  Users,
  Mail,
  Phone,
  Target,
  ChevronDown,
  HelpCircle,
  icons,
  CheckCircle,
} from 'lucide-react';

type FundingTimelineOptions = '6m_less' | '6m_1y' | '1y_more';
type ContactPreferenceOptions = 'email' | 'phone';

export default function CreateGrantPage() {
  const [showForm, setShowForm] = useState(false);
  const [objectives, setObjectives] = useState('');
  const [fundingAmount, setFundingAmount] = useState<string>('');
  const [fundingTimeline, setFundingTimeline] = useState<FundingTimelineOptions | ''>('');
  const [needsExpertHelp, setNeedsExpertHelp] = useState<boolean>(false);
  const [contactPreference, setContactPreference] = useState<ContactPreferenceOptions | ''>('');
  const [contactDetail, setContactDetail] = useState('');

  const fundingTimelineLabels: Record<FundingTimelineOptions, string> = {
    '6m_less': '6 months or less',
    '6m_1y': '6 months - 1 year',
    '1y_more': 'Over a year',
  };

  const handleSubmit = () => {
    console.log({
      objectives,
      fundingAmount,
      fundingTimeline,
      needsExpertHelp,
      contactPreference,
      contactDetail,
    });
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
        <div className="text-center pb-8">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">Open an RFP</h1>
            <p className="text-lg text-gray-600">Accelerate scientific research with an RFP.</p>
          </div>
        </div>

        {!showForm && (
          <>
            <div className="text-center pt-4 mb-8">
              <Button
                size="lg"
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-[100px] rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-xl shadow-lg my-8">
              <div className="bg-white p-6 md:p-8 rounded-lg space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                  Why fund with ResearchHub RFPs?
                </h2>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                  {[
                    {
                      title: 'Fast Turnaround',
                      text: 'See high-quality applicants quickly and efficiently.',
                      iconName: 'Rocket',
                      style: {
                        iconColor: 'text-black-500',
                        titleColor: 'text-black-700',
                      },
                    },
                    {
                      title: 'Quality Researchers',
                      text: 'Access a global network of vetted, reputable scientists and academics.',
                      iconName: 'Users',
                      style: {
                        iconColor: 'text-black-500',
                        titleColor: 'text-black-700',
                      },
                    },
                    {
                      title: 'Fully Open & Transparent',
                      text: 'Applicants submit pre-registrations, ensuring clarity and openness from the start.',
                      iconName: 'FileText',
                      style: {
                        iconColor: 'text-black-500',
                        titleColor: 'text-black-700',
                      },
                    },
                    {
                      title: 'Low Overhead',
                      text: 'Maximize your impact with our streamlined, cost-effective platform.',
                      iconName: 'TrendingDown',
                      style: {
                        iconColor: 'text-black-500',
                        titleColor: 'text-black-700',
                      },
                    },
                    {
                      title: 'Tax Deductible',
                      text: 'Contributions may be tax-deductible. (Consult your tax advisor).',
                      iconName: 'ShieldCheck',
                      style: {
                        iconColor: 'text-black-500',
                        titleColor: 'text-black-700',
                      },
                    },
                    {
                      title: 'Expert Support',
                      text: 'We assign a dedicated contact person to ensure your RFP process is smooth and successful.',
                      iconName: 'LifeBuoy',
                      style: {
                        iconColor: 'text-black-500',
                        titleColor: 'text-black-700',
                      },
                    },
                  ].map((benefit, index) => {
                    const LucideIcon = icons[benefit.iconName as keyof typeof icons] || CheckCircle;
                    const itemStyle = benefit.style;
                    return (
                      <div key={index} className="flex items-start space-x-4 p-2">
                        <LucideIcon
                          size={32}
                          className={`${itemStyle.iconColor} mt-0.5 flex-shrink-0`}
                        />
                        <div>
                          <h3 className={`text-lg font-semibold ${itemStyle.titleColor}`}>
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{benefit.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {showForm && (
          <>
            <div className="space-y-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Objectives</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Clearly outline the primary goals and aims of your grant.
                </p>
                <Textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Describe the objectives of your grant..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Funding Amount</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Specify the total amount of funding you are requesting (e.g., in USD).
                </p>
                <Input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="e.g., 50000"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={20} className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Funding Timeline</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Select the estimated duration for which you'll need the funding.
                </p>
                <Dropdown
                  label=""
                  trigger={
                    <Button variant="outlined" className="w-full justify-between">
                      {fundingTimeline
                        ? fundingTimelineLabels[fundingTimeline as FundingTimelineOptions]
                        : 'Select timeline'}
                      <ChevronDown size={16} className="text-gray-500" />
                    </Button>
                  }
                >
                  <DropdownItem onClick={() => setFundingTimeline('6m_less')}>
                    {fundingTimelineLabels['6m_less']}
                  </DropdownItem>
                  <DropdownItem onClick={() => setFundingTimeline('6m_1y')}>
                    {fundingTimelineLabels['6m_1y']}
                  </DropdownItem>
                  <DropdownItem onClick={() => setFundingTimeline('1y_more')}>
                    {fundingTimelineLabels['1y_more']}
                  </DropdownItem>
                </Dropdown>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Expert Help</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Do you require expert assistance for your project (e.g., collaborators, specific
                  skills)?
                </p>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={needsExpertHelp ? 'default' : 'outlined'}
                    onClick={() => setNeedsExpertHelp(true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!needsExpertHelp ? 'default' : 'outlined'}
                    onClick={() => {
                      setNeedsExpertHelp(false);
                      setContactPreference('');
                      setContactDetail('');
                    }}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>

              {needsExpertHelp && (
                <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {contactPreference === 'email' ? (
                        <Mail size={20} className="text-gray-600" />
                      ) : contactPreference === 'phone' ? (
                        <Phone size={20} className="text-gray-600" />
                      ) : (
                        <HelpCircle size={20} className="text-gray-600" />
                      )}
                      <h2 className="text-xl font-semibold text-gray-800">Contact Preference</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      How would you prefer experts to contact you?
                    </p>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant={contactPreference === 'email' ? 'default' : 'outlined'}
                        onClick={() => {
                          setContactPreference('email');
                          setContactDetail('');
                        }}
                        className="flex-1"
                      >
                        <Mail size={16} className="mr-2" /> Email
                      </Button>
                      <Button
                        variant={contactPreference === 'phone' ? 'default' : 'outlined'}
                        onClick={() => {
                          setContactPreference('phone');
                          setContactDetail('');
                        }}
                        className="flex-1"
                      >
                        <Phone size={16} className="mr-2" /> Phone
                      </Button>
                    </div>
                  </div>

                  {contactPreference === 'email' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Please provide your email address.</p>
                      <Input
                        type="email"
                        value={contactDetail}
                        onChange={(e) => setContactDetail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  )}

                  {contactPreference === 'phone' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Please provide your phone number.</p>
                      <Input
                        type="tel"
                        value={contactDetail}
                        onChange={(e) => setContactDetail(e.target.value)}
                        placeholder="(123) 456-7890"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <Button size="lg" className="w-full" onClick={handleSubmit}>
                  Submit Grant Application
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
