import React, { FC, useState, MouseEvent } from 'react';
import { StaticImageData } from 'next/image';
import { Mail, Linkedin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Editor } from '../lib/journalConstants';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';

interface EditorCardProps {
  editor: Editor;
  className?: string;
}

export const EditorCard: FC<EditorCardProps> = ({ editor, className }) => {
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

  return (
    <div
      className={cn(
        'border-b border-gray-200 pb-4 last:border-b-0 transition-all duration-200 ease-in-out px-4 py-3',
        showExpandButton && 'cursor-pointer hover:bg-gray-50 rounded-md',
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
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1" onClick={handleAvatarClick}>
          <Avatar
            src={typeof editor.image === 'string' ? editor.image : ''}
            alt={editor.name}
            size="md"
            authorId={editor.authorId ? parseInt(editor.authorId) : undefined}
            disableTooltip={true}
            className="mt-0.5"
          />
        </div>

        <div className="flex-grow">
          <p className="text-sm font-medium text-gray-800">{editor.name}</p>
          <p className="text-xs text-gray-500">{editor.role}</p>
          <div className="flex space-x-2 mt-1">
            <a
              href={editorMailto}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-600"
              aria-label={`Email ${editor.name}`}
              onClick={handleSocialLinkClick}
            >
              <Mail className="w-3 h-3" />
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
                <Linkedin className="w-3 h-3" />
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
                <GraduationCap className="w-3 h-3" />
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
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {isBioExpanded && <p className="mt-3 text-xs text-gray-600 leading-relaxed">{editor.bio}</p>}
    </div>
  );
};
