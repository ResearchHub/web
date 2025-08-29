import React, { FC, useState, MouseEvent } from 'react';
import { StaticImageData } from 'next/image';
import {
  Mail,
  Linkedin,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Editor } from '../lib/journalConstants';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from 'react-hot-toast';

interface EditorCardProps {
  editor: Editor;
  className?: string;
  size?: 'sm' | 'lg';
}

export const EditorCard: FC<EditorCardProps> = ({ editor, className, size = 'sm' }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isMailHovered, setIsMailHovered] = useState(false);

  const editorEmail = editor.socialLinks.email;

  // Check if this is a special entry that should link to external URL
  const isExternalLink =
    (editor.socialLinks.linkedin || editor.socialLinks.website) &&
    (editor.name === 'Meet the Editor Team' || editor.name === 'Interested in joining?');

  // Check if this editor should have collapsible functionality disabled
  const disableCollapsible =
    editor.name === 'Emilio Merheb, PhD' || editor.name === 'Attila Karsi, PhD';

  const bioPreviewLength = 150;
  const showExpandButton = editor.bio.length > bioPreviewLength && !disableCollapsible;

  const handleCardClick = () => {
    if (isExternalLink && (editor.socialLinks.linkedin || editor.socialLinks.website)) {
      const url = editor.socialLinks.website || editor.socialLinks.linkedin;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (showExpandButton) {
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

  const handleCopyEmail = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editorEmail) {
      navigator.clipboard.writeText(editorEmail);
      toast.success(`Copied ${editorEmail}`, {
        className: 'md:min-w-[450px]',
      });
    }
  };

  const handleAvatarClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const isLarge = size === 'lg';

  return (
    <div
      className={cn(
        'border-b border-gray-200 pb-3 last:border-b-0 transition-all duration-200 ease-in-out px-4 py-2',
        (showExpandButton || isExternalLink) && 'cursor-pointer hover:bg-gray-50 rounded-md',
        isLarge && 'p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md',
        isLarge && 'last:border-b',
        className
      )}
      onClick={handleCardClick}
      role={showExpandButton || isExternalLink ? 'button' : undefined}
      aria-expanded={isBioExpanded}
      tabIndex={showExpandButton || isExternalLink ? 0 : undefined}
      onKeyDown={(e) => {
        if ((showExpandButton || isExternalLink) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          if (isExternalLink && (editor.socialLinks.linkedin || editor.socialLinks.website)) {
            const url = editor.socialLinks.website || editor.socialLinks.linkedin;
            window.open(url, '_blank', 'noopener,noreferrer');
          } else if (showExpandButton) {
            setIsBioExpanded(!isBioExpanded);
          }
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
            {!isExternalLink && editorEmail && (
              <button
                type="button"
                className="text-gray-400 hover:text-primary-600 bg-transparent border-none cursor-pointer"
                aria-label={`Copy ${editorEmail}`}
                onClick={handleCopyEmail}
                onMouseEnter={() => setIsMailHovered(true)}
                onMouseLeave={() => setIsMailHovered(false)}
                onFocus={() => setIsMailHovered(true)}
                onBlur={() => setIsMailHovered(false)}
              >
                {isMailHovered ? (
                  <Copy className={isLarge ? 'w-5 h-5' : 'w-3 h-3'} />
                ) : (
                  <Mail className={isLarge ? 'w-5 h-5' : 'w-3 h-3'} />
                )}
              </button>
            )}
            {editor.socialLinks.linkedin && !isExternalLink && (
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

        {isExternalLink && (
          <div className="flex-shrink-0 mt-1">
            <ExternalLink className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
          </div>
        )}

        {showExpandButton && !isExternalLink && (
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

      {isBioExpanded && !isExternalLink && (
        <p
          className={cn('text-gray-600 leading-relaxed', isLarge ? 'mt-5 text-sm' : 'mt-3 text-xs')}
        >
          {editor.bio}
        </p>
      )}
    </div>
  );
};
