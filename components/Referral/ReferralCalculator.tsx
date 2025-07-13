'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUser } from '@fortawesome/pro-light-svg-icons';

export function ReferralCalculator() {
  const [fundingAmount, setFundingAmount] = useState(7100);
  const referralBonus = fundingAmount * 0.1;

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFundingAmount(Number(event.target.value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setFundingAmount(0);
      return;
    }
    const numValue = Number(value.replace(/,/g, ''));
    if (!isNaN(numValue)) {
      setFundingAmount(numValue);
    }
  };

  return (
    <section className="mt-12">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full">
        <div className="flex flex-col items-center mb-6">
          <Calculator className="h-8 w-8 text-slate-400 mb-3" />
          <h3 className="text-2xl font-semibold text-center text-white">
            Estimate Your Referral Bonus
          </h3>
        </div>
        <div className="mb-8">
          <label
            htmlFor="fundingAmount"
            className="block text-sm font-medium text-slate-300 mb-3 text-center"
          >
            If your referred funder contributes:
          </label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-400 text-3xl font-light">$</span>
            <input
              type="text"
              id="fundingAmount"
              value={fundingAmount.toLocaleString('en-US')}
              onChange={handleInputChange}
              className="w-48 bg-transparent border-b-2 border-slate-600 text-white text-4xl font-bold focus:outline-none focus:border-blue-500 text-center pb-1"
              placeholder="1,000"
            />
          </div>
          <input
            type="range"
            min="0"
            max="50000"
            step="100"
            value={fundingAmount}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-6 slider-thumb"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700 p-4 rounded-lg flex items-center gap-4">
            <FontAwesomeIcon icon={faUser} className="h-7 w-7 text-blue-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-200">You Receive</p>
            </div>
            <p className="text-2xl font-bold text-white ml-auto">
              $
              {referralBonus.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg flex items-center gap-4">
            <FontAwesomeIcon icon={faUserTie} className="h-7 w-7 text-blue-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-200">Funder Receives</p>
            </div>
            <p className="text-2xl font-bold text-white ml-auto">
              $
              {referralBonus.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
