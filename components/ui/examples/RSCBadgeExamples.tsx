'use client';

import React from 'react';
import { CurrencyBadge } from '../CurrencyBadge';

export const CurrencyBadgeExamples = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">CurrencyBadge Component Examples</h1>
      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Basic Usage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="mb-1 text-sm text-gray-600">RSC (default)</p>
              <CurrencyBadge amount={111} />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">USD Currency</p>
              <CurrencyBadge amount={250} currency="USD" />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Shortened RSC</p>
              <CurrencyBadge amount={17500} shorten />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Shortened USD</p>
              <CurrencyBadge amount={12345} currency="USD" shorten />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <CurrencyBadge amount={111} size="xxs" />
            <CurrencyBadge amount={111} size="xs" />
            <CurrencyBadge amount={111} size="sm" />
            <CurrencyBadge amount={111} size="md" />
            <CurrencyBadge amount={250} currency="USD" size="sm" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Variants</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <CurrencyBadge amount={111} variant="badge" />
            <CurrencyBadge amount={111} variant="inline" />
            <CurrencyBadge amount={111} variant="contribute" />
            <CurrencyBadge amount={111} variant="text" />
            <CurrencyBadge amount={111} variant="award" />
            <CurrencyBadge amount={111} variant="received" />
            <CurrencyBadge amount={111} variant="disabled" />
            <CurrencyBadge amount={250} currency="USD" variant="badge" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Customization</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <CurrencyBadge amount={111} inverted={true} />
            <CurrencyBadge amount={111} label="awarded" />
            <CurrencyBadge amount={111} inverted={true} label="RSC back" />
            <CurrencyBadge amount={250} currency="USD" label="Price" />
            <CurrencyBadge amount={111} showText={false} />
            <CurrencyBadge amount={111} showIcon={false} />
            <CurrencyBadge
              amount={120.75}
              textColor="text-blue-600"
              currencyLabelColor="text-blue-400"
            />
            <CurrencyBadge amount={50} currency="USD" textColor="text-green-600" />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Tooltip Behavior</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <p className="mb-1 text-sm text-gray-600">RSC (shows USD in tooltip)</p>
              <CurrencyBadge amount={1000} showExchangeRate={true} />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">USD (shows RSC in tooltip)</p>
              <CurrencyBadge amount={50} currency="USD" showExchangeRate={true} />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Tooltip Disabled</p>
              <CurrencyBadge amount={1000} showExchangeRate={false} />
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">USD - Tooltip Disabled</p>
              <CurrencyBadge amount={50} currency="USD" showExchangeRate={false} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
