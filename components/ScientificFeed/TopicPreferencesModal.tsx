'use client';

import { BaseModal } from '@/components/ui/BaseModal';
import { cn } from '@/utils/styles';
import { Check, Plus } from 'lucide-react';

interface TopicPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  followedTopics: string[];
  onToggleTopic?: (topic: string) => void;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  subcategories: SubCategory[];
}

// Mock data for science topics
const SCIENCE_CATEGORIES: Category[] = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    emoji: '💻',
    subcategories: [
      { id: 'ai-ml', name: 'Artificial Intelligence & Machine Learning' },
      { id: 'algorithms', name: 'Algorithms & Data Structures' },
      { id: 'cybersecurity', name: 'Cybersecurity' },
      { id: 'distributed-systems', name: 'Distributed Systems' },
      { id: 'hci', name: 'Human-Computer Interaction' },
      { id: 'programming-languages', name: 'Programming Languages' },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    emoji: '🧬',
    subcategories: [
      { id: 'genetics', name: 'Genetics' },
      { id: 'molecular-biology', name: 'Molecular Biology' },
      { id: 'neuroscience', name: 'Neuroscience' },
      { id: 'ecology', name: 'Ecology' },
      { id: 'microbiology', name: 'Microbiology' },
      { id: 'evolutionary-biology', name: 'Evolutionary Biology' },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    emoji: '🧪',
    subcategories: [
      { id: 'organic-chemistry', name: 'Organic Chemistry' },
      { id: 'inorganic-chemistry', name: 'Inorganic Chemistry' },
      { id: 'physical-chemistry', name: 'Physical Chemistry' },
      { id: 'analytical-chemistry', name: 'Analytical Chemistry' },
      { id: 'biochemistry', name: 'Biochemistry' },
      { id: 'materials-science', name: 'Materials Science' },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    emoji: '⚛️',
    subcategories: [
      { id: 'quantum-physics', name: 'Quantum Physics' },
      { id: 'astrophysics', name: 'Astrophysics' },
      { id: 'particle-physics', name: 'Particle Physics' },
      { id: 'condensed-matter', name: 'Condensed Matter Physics' },
      { id: 'thermodynamics', name: 'Thermodynamics' },
      { id: 'optics', name: 'Optics' },
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    emoji: '📐',
    subcategories: [
      { id: 'pure-mathematics', name: 'Pure Mathematics' },
      { id: 'applied-mathematics', name: 'Applied Mathematics' },
      { id: 'statistics', name: 'Statistics' },
      { id: 'topology', name: 'Topology' },
      { id: 'number-theory', name: 'Number Theory' },
      { id: 'graph-theory', name: 'Graph Theory' },
    ],
  },
  {
    id: 'medicine',
    name: 'Medicine',
    emoji: '🏥',
    subcategories: [
      { id: 'cardiology', name: 'Cardiology' },
      { id: 'oncology', name: 'Oncology' },
      { id: 'immunology', name: 'Immunology' },
      { id: 'pharmacology', name: 'Pharmacology' },
      { id: 'epidemiology', name: 'Epidemiology' },
      { id: 'clinical-trials', name: 'Clinical Trials' },
    ],
  },
  {
    id: 'environmental-science',
    name: 'Environmental Science',
    emoji: '🌍',
    subcategories: [
      { id: 'climate-science', name: 'Climate Science' },
      { id: 'conservation', name: 'Conservation Biology' },
      { id: 'renewable-energy', name: 'Renewable Energy' },
      { id: 'oceanography', name: 'Oceanography' },
      { id: 'atmospheric-science', name: 'Atmospheric Science' },
      { id: 'sustainability', name: 'Sustainability' },
    ],
  },
];

export function TopicPreferencesModal({
  isOpen,
  onClose,
  followedTopics,
  onToggleTopic,
}: TopicPreferencesModalProps) {
  const isTopicFollowed = (topicName: string) => {
    return followedTopics.includes(topicName);
  };

  const handleToggleTopic = (topicName: string) => {
    onToggleTopic?.(topicName);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Topic Preferences"
      maxWidth="max-w-[700px]"
      showCloseButton={true}
      padding="p-6"
    >
      <div className="space-y-8">
        <p className="text-sm text-gray-600">
          Browse all available topics by category. Click to follow or unfollow.
        </p>
        {SCIENCE_CATEGORIES.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            </div>

            {/* Subcategory Cards */}
            <div className="grid grid-cols-3 gap-3">
              {category.subcategories.map((subcategory) => {
                const isFollowed = isTopicFollowed(subcategory.name);
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleToggleTopic(subcategory.name)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border-2 transition-all group',
                      isFollowed
                        ? 'bg-primary-50 border-primary-500 hover:bg-primary-100'
                        : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium text-left',
                        isFollowed ? 'text-gray-900' : 'text-gray-700'
                      )}
                    >
                      {subcategory.name}
                    </span>
                    {isFollowed ? (
                      <Check className="w-5 h-5 text-primary-600 flex-shrink-0 ml-2" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
}

