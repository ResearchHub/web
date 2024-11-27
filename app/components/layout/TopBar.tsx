'use client'

import { Search, FileText, Notebook, Bell, CircleUser, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export const TopBar: React.FC = () => (
  <div className="sticky top-0 backdrop-blur-md bg-white/80 border-b border-gray-100 z-40 h-16">
    <div className="max-w-3xl mx-auto h-full px-4">
      <div className="flex items-center justify-between h-full">
        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers, reviews, grants..."
            className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-200"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700">
            <FileText className="h-4 w-4" />
            <span>Publish</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <Link href="/notebook">
            <button className="relative">
              <Notebook className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
            </button>
          </Link>
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          <button className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <CircleUser className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
