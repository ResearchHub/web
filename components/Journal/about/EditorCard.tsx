import React, { FC, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Mail, Linkedin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Editor } from '../lib/journalConstants';
import { cn } from '@/utils/styles';

interface EditorCardProps {
  editor: Editor;
  className?: string;
}

export const EditorCard: FC<EditorCardProps> = ({ editor, className }) => {
  const router = useRouter();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const bioPreviewLength = 150;
  const showExpandButton = editor.bio.length > bioPreviewLength;

  const editorMailto = `mailto:${editor.socialLinks.email}`;

  const handleNavigate = () => {
    if (editor.authorId) {
      router.push(`/author/${editor.authorId}`);
    }
  };

  return (
    <div
      className={cn(
        'border-b border-gray-200 pb-4 last:border-b-0 transition-all duration-200 ease-in-out',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <a
          onClick={handleNavigate}
          className="flex-shrink-0 mt-1 cursor-pointer"
          aria-label={`View profile for ${editor.name}`}
        >
          <Image
            src={editor.image as StaticImageData}
            alt={editor.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
            placeholder={typeof editor.image !== 'string' ? 'blur' : undefined}
          />
        </a>

        <div className="flex-grow">
          <a
            onClick={handleNavigate}
            className="text-sm font-medium text-gray-800 hover:text-primary-600 block cursor-pointer"
          >
            {editor.name}
          </a>
          <p className="text-xs text-gray-500">{editor.role}</p>
          <div className="flex space-x-2 mt-1">
            <a
              href={editorMailto}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-600"
              aria-label={`Email ${editor.name}`}
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
            onClick={() => setIsBioExpanded(!isBioExpanded)}
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
