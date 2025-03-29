'use client';

import { useState } from 'react';
import { Navigation } from '@/app/layouts/Navigation';

export default function IconTest() {
  const [currentPath, setCurrentPath] = useState('/');

  const handleFeatureNotification = (featureName: string) => {
    alert(`${featureName} feature is not yet implemented`);
  };

  const handlePathChange = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold mb-4">Navigation Icons Test</h1>
          <p className="text-gray-500 mb-4">
            Click on different paths below to see the navigation with solid icons when selected.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handlePathChange('/')}
              className={`px-3 py-1 rounded ${currentPath === '/' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Home
            </button>
            <button
              onClick={() => handlePathChange('/earn')}
              className={`px-3 py-1 rounded ${currentPath === '/earn' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Earn
            </button>
            <button
              onClick={() => handlePathChange('/fund')}
              className={`px-3 py-1 rounded ${currentPath === '/fund' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Fund
            </button>
            <button
              onClick={() => handlePathChange('/journal')}
              className={`px-3 py-1 rounded ${currentPath === '/journal' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Journal
            </button>
            <button
              onClick={() => handlePathChange('/notebook')}
              className={`px-3 py-1 rounded ${currentPath === '/notebook' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Notebook
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 mb-4">Current path: {currentPath}</p>
            <Navigation
              currentPath={currentPath}
              onUnimplementedFeature={handleFeatureNotification}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold mb-4">Icon Mapping</h1>
          <p className="text-gray-500 mb-6">
            Here's how the icons map between regular and solid variants
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="font-medium">Navigation Item</div>
              <div className="font-medium">Regular Icon</div>
              <div className="font-medium">Solid Icon (Selected)</div>
            </div>

            <div className="flex items-center justify-between">
              <div>Earn</div>
              <div>earn1</div>
              <div>solidCoin</div>
            </div>

            <div className="flex items-center justify-between">
              <div>Fund</div>
              <div>fund</div>
              <div>solidHand</div>
            </div>

            <div className="flex items-center justify-between">
              <div>Journal</div>
              <div>rhJournal1</div>
              <div>solidBook</div>
            </div>

            <div className="flex items-center justify-between">
              <div>Notebook</div>
              <div>labNotebook2</div>
              <div>solidNotebook</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
