'use client'

import { useState } from 'react';
import { Search, Bell, CircleUser, Menu, BadgeCheck, X, AlertCircle } from 'lucide-react';
import { searchFeedItems } from '@/store/feedStore';
import { getItemTypeConfig } from '@/components/FeedItem';
import toast from 'react-hot-toast';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value;
    setQuery(searchQuery);
    const searchResults = searchFeedItems(searchQuery).map(entry => entry.item);
    setResults(searchResults);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const handleUnimplementedFeature = () => {
    toast((t) => (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5" />
        <span>Implementation coming soon</span>
      </div>
    ), {
      duration: 2000,
      position: 'bottom-right',
      style: {
        background: '#FFF7ED', // Orange-50
        color: '#EA580C',     // Orange-600
        border: '1px solid #FDBA74', // Orange-300
      },
    });
  };

  return (
    <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-20 h-16">
      <div className="lg:ml-10 lg:mr-10 h-full">
        <div className="h-full max-w-4xl mx-auto flex items-center justify-between">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers, reviews, grants..."
              className="pl-10 pr-10 py-2.5 bg-gray-50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-200"
              value={query}
              onChange={handleSearch}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Render search results */}
            {results.length > 0 && (
              <div className="absolute left-0 right-0 bg-white shadow-lg rounded-lg mt-2 z-10 max-h-[80vh] overflow-y-auto w-[500px]">
                <ul className="divide-y divide-gray-100">
                  {results.map((item, index) => {
                    const { icon: IconComponent, label } = getItemTypeConfig(item.type);
                    return (
                      <li key={index} className="p-4 hover:bg-gray-50">
                        {/* Type Badge */}
                        <div className="flex items-center mb-2">
                          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200">
                            <IconComponent className="w-3 h-3 mr-1" />
                            {label}
                          </div>
                        </div>

                        {/* Title and Authors */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                          {item.type === 'paper' && item.authors && (
                            <div className="flex-1 text-xs text-gray-600 mt-1">
                              {item.authors.map((author, i) => (
                                <span key={i} className="inline-flex items-center">
                                  <span>{author.name}</span>
                                  {author.verified && (
                                    <BadgeCheck className="h-4 w-4 text-blue-500 ml-1 inline" />
                                  )}
                                  {i < item.authors.length - 1 && (
                                    <span className="mx-2 text-gray-400">•</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mt-1">
                          {item.description.length > 100 
                            ? `${item.description.slice(0, 100)}...` 
                            : item.description}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>        

          <div className="flex items-center space-x-4">
            <button 
              className="relative"
              onClick={handleUnimplementedFeature}
            >
              <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>
            <button 
              className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"
              onClick={handleUnimplementedFeature}
            >
              <CircleUser className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
