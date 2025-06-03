'use client';

import { useState } from 'react';
import { Grid3X3, Users, FileText, Award, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/Search/Search';
import { PageLayout } from '@/app/layouts/PageLayout';
import { SearchSuggestion } from '@/types/search';
import Link from 'next/link';

export default function CreateHubPage() {
  const [hubName, setHubName] = useState('');
  const [description, setDescription] = useState('');
  const [hubType, setHubType] = useState<'community' | 'journal'>('community');
  const [editors, setEditors] = useState<
    Array<{
      id: string | number;
      fullName: string;
      profileImage?: string;
      headline?: string;
    }>
  >([
    // Default current user - this would come from auth context in real app
    {
      id: 'current-user',
      fullName: 'You',
      profileImage: undefined,
      headline: 'Current User',
    },
  ]);

  // Mock user reputation - would come from auth/user context
  const userReputation = 150; // Example: user has enough rep
  const minimumRep = 100;
  const canCreateHub = userReputation >= minimumRep;

  const handleEditorSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.entityType === 'user' || suggestion.entityType === 'author') {
      // Ensure we have a valid ID
      if (!suggestion.id) return;

      const author = {
        id: suggestion.id,
        fullName: suggestion.authorProfile.fullName,
        profileImage: suggestion.authorProfile.profileImage,
        headline: suggestion.authorProfile.headline,
      };

      // Check if editor already exists
      const exists = editors.some((editor) => editor.id === author.id);
      if (!exists) {
        setEditors([...editors, author]);
      }
    }
  };

  // Filter function to only show users/authors
  const filterUsersOnly = (suggestions: SearchSuggestion[]) => {
    return suggestions.filter((suggestion) => suggestion.entityType === 'user');
  };

  const handleRemoveEditor = (authorId: string | number) => {
    if (authorId === 'current-user') return; // Can't remove current user
    setEditors(editors.filter((editor) => editor.id !== authorId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateHub) return;

    // Handle hub creation logic here
    console.log({
      hubName,
      description,
      hubType,
      editors,
    });
  };

  const isFormValid = hubName.trim() && description.trim() && editors.length > 0;

  return (
    <PageLayout rightSidebar={false} maxWidth="default">
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
                <Grid3X3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Hub</h1>
              <p className="text-lg text-gray-600">
                Build a community around your research interests
              </p>
            </div>
          </div>

          {/* Reputation Check */}
          {!canCreateHub && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Minimum {minimumRep} reputation points required
                  </p>
                  <p className="text-sm text-yellow-700">
                    You currently have {userReputation} points. You need{' '}
                    {minimumRep - userReputation} more points to create a hub.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hub Name */}
              <div>
                <label htmlFor="hubName" className="block text-sm font-medium text-gray-700 mb-2">
                  Hub Name *
                </label>
                <input
                  type="text"
                  id="hubName"
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  placeholder="e.g., Quantum Computing Research"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={!canCreateHub}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Short Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this hub is about and what kind of research it focuses on..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={!canCreateHub}
                />
              </div>

              {/* Hub Type Pills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Hub Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHubType('community')}
                    disabled={!canCreateHub}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      hubType === 'community'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!canCreateHub ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="font-medium text-gray-900">Community</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      A collaborative space for discussions and knowledge sharing
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHubType('journal')}
                    disabled={!canCreateHub}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      hubType === 'journal'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!canCreateHub ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="font-medium text-gray-900">Journal</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      A peer-reviewed publication venue for research papers
                    </p>
                  </button>
                </div>
              </div>

              {/* Editors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Co-Editors</label>

                {/* Current Editors */}
                <div className="space-y-2 mb-3">
                  {editors.map((editor) => (
                    <div
                      key={editor.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{editor.fullName}</p>
                          {editor.headline && (
                            <p className="text-sm text-gray-600">{editor.headline}</p>
                          )}
                        </div>
                      </div>
                      {editor.id !== 'current-user' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditor(editor.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          disabled={!canCreateHub}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Editor */}
                <div className={!canCreateHub ? 'opacity-50 pointer-events-none' : ''}>
                  <Search
                    onSelect={handleEditorSelect}
                    placeholder="Search for co-editors..."
                    indices={['user']}
                    filterSuggestions={filterUsersOnly}
                    className="w-full"
                    showSuggestionsOnFocus={false}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!canCreateHub || !isFormValid}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  {canCreateHub ? (
                    <>
                      <Check className="h-5 w-5" />
                      Create Hub
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5" />
                      Need {minimumRep - userReputation} More Rep Points
                    </>
                  )}
                </Button>

                {canCreateHub && !isFormValid && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Please fill in all required fields
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your hub will be reviewed by our moderation team</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• You can start inviting members and posting content</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
