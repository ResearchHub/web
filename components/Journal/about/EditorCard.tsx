import React, { FC, useState, MouseEvent } from 'react';
import { StaticImageData } from 'next/image';
import { Mail, Linkedin, GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Editor } from '../lib/journalConstants';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';

interface EditorCardProps {
  editor: Editor;
  className?: string;
  size?: 'sm' | 'lg';
}

export const EditorCard: FC<EditorCardProps> = ({ editor, className, size = 'sm' }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const bioPreviewLength = 150;
  const showExpandButton = editor.bio.length > bioPreviewLength;

  const editorMailto = `mailto:${editor.socialLinks.email}`;

  const handleCardClick = () => {
    if (showExpandButton) {
      setIsBioExpanded(!isBioExpanded);
    }
  };

  const handleSocialLinkClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleExpandButtonClick = (e: MouseEvent) => {
    e.stopPropagation();
    setIsBioExpanded(!isBioExpanded);
  };

  const handleAvatarClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const isLarge = size === 'lg';

  return (
    <div
      className={cn(
        'border-b border-gray-200 pb-4 last:border-b-0 transition-all duration-200 ease-in-out px-4 py-3',
        showExpandButton && 'cursor-pointer hover:bg-gray-50 rounded-md',
        isLarge && 'p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md',
        isLarge && 'last:border-b',
        className
      )}
      onClick={handleCardClick}
      role={showExpandButton ? 'button' : undefined}
      aria-expanded={isBioExpanded}
      tabIndex={showExpandButton ? 0 : undefined}
      onKeyDown={(e) => {
        if (showExpandButton && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setIsBioExpanded(!isBioExpanded);
        }
      }}
    >
      <div className={cn('flex items-start', isLarge ? 'space-x-8' : 'space-x-3')}>
        <div className="flex-shrink-0 mt-1" onClick={handleAvatarClick}>
          <Avatar
            src={typeof editor.image === 'string' ? editor.image : ''}
            alt={editor.name}
            size={isLarge ? 56 : 'md'}
            authorId={editor.authorId ? parseInt(editor.authorId) : undefined}
            disableTooltip={true}
            className="mt-0.5"
          />
        </div>

        <div className="flex-grow">
          <p className={cn('font-medium text-gray-800', isLarge ? 'text-lg' : 'text-sm')}>
            {editor.name}
          </p>
          <p className={cn('text-gray-500', isLarge ? 'text-sm' : 'text-xs')}>{editor.role}</p>
          <div className={cn('flex mt-1', isLarge ? 'space-x-3 mt-2' : 'space-x-2')}>
            <a
              href={editorMailto}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-600"
              aria-label={`Email ${editor.name}`}
              onClick={handleSocialLinkClick}
            >
              <Mail className={isLarge ? 'w-5 h-5' : 'w-3 h-3'} />
            </a>
            {editor.socialLinks.linkedin && (
              <a
                href={editor.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600"
                aria-label={`${editor.name} LinkedIn`}
                onClick={handleSocialLinkClick}
              >
                <Linkedin className={isLarge ? 'w-5 h-5' : 'w-3 h-3'} />
              </a>
            )}
            {editor.socialLinks.scholar && (
              <a
                href={editor.socialLinks.scholar}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600"
                aria-label={`${editor.name} Google Scholar`}
                onClick={handleSocialLinkClick}
              >
                <GraduationCap className={isLarge ? 'w-5 h-5' : 'w-3 h-3'} />
              </a>
            )}
          </div>
        </div>

        {showExpandButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpandButtonClick}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1 !h-auto !w-auto p-0"
            aria-label={isBioExpanded ? 'Collapse bio' : 'Expand bio'}
          >
            {isBioExpanded ? (
              <ChevronDown className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
            ) : (
              <ChevronRight className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
            )}
          </Button>
        )}
      </div>

      {isBioExpanded && (
        <p
          className={cn('text-gray-600 leading-relaxed', isLarge ? 'mt-5 text-sm' : 'mt-3 text-xs')}
        >
          {editor.bio}
        </p>
      )}
    </div>
  );
};
