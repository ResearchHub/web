import { Topic } from '@/types/topic';

interface InterestCardProps {
  topic: Topic;
  isFollowing: boolean;
  onFollowToggle: (topicId: number, isFollowing: boolean) => void;
}

export function InterestCard({ topic, isFollowing, onFollowToggle }: InterestCardProps) {
  const handleClick = () => {
    onFollowToggle(topic.id, isFollowing);
  };

  const getInitialBgColor = (namespace: string) => {
    switch (namespace) {
      case 'journal':
        return 'bg-blue-100';
      case 'topic':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getInitialTextColor = (namespace: string) => {
    switch (namespace) {
      case 'journal':
        return 'text-blue-700';
      case 'topic':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left w-full relative overflow-hidden
        ${
          isFollowing
            ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
            : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-12">
          {topic.imageUrl ? (
            <img
              src={topic.imageUrl}
              alt={topic.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center
                ${getInitialBgColor(topic.namespace || 'topic')}`}
            >
              <span
                className={`text-xl font-medium ${getInitialTextColor(topic.namespace || 'topic')}`}
              >
                {topic.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-medium break-words line-clamp-2 text-clip">{topic.name}</h3>
          </div>
          {topic.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{topic.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
