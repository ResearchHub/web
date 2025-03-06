'use client';

import { RSCBadge } from '../RSCBadge';

export const RSCBadgeExamples = () => {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-semibold mb-4">RSCBadge Component Examples</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Color Scheme</h3>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="mb-3 text-sm text-gray-700">The RSCBadge features:</p>
          <div className="flex items-center gap-4">
            <RSCBadge amount={111} />
            <ul className="text-sm text-gray-700 list-disc ml-4">
              <li>Orange background</li>
              <li>Orange amount text</li>
              <li>Gray "RSC" text</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} size="xs" />
            <span className="text-sm text-gray-600">Extra Small</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} size="sm" />
            <span className="text-sm text-gray-600">Small (Default)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} size="md" />
            <span className="text-sm text-gray-600">Medium</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Variants</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} variant="badge" />
            <span className="text-sm text-gray-600">Badge (Default)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} variant="inline" />
            <span className="text-sm text-gray-600">Inline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} variant="contribute" />
            <span className="text-sm text-gray-600">Contribute</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Inverted & Labels</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} inverted={true} />
            <span className="text-sm text-gray-600">Inverted</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} label="awarded" />
            <span className="text-sm text-gray-600">With Label</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <RSCBadge amount={111} inverted={true} label="awarded" />
            <span className="text-sm text-gray-600">Inverted with Label</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">In Context</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <span className="font-medium">Bounty Amount</span>
              <RSCBadge amount={111} />
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-md text-orange-700 hover:bg-orange-100 transition-colors">
            <span>Contribute</span>
            <RSCBadge amount={111} variant="inline" showText={false} />
          </button>
        </div>
      </div>
    </div>
  );
};
