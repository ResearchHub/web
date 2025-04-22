import React, { FC, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { Mail, Linkedin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Editor } from '../lib/journalConstants';
import { cn } from '@/utils/styles';

type EditorCardVariant = 'default' | 'sidebar';

interface EditorCardProps {
  editor: Editor;
  variant?: EditorCardVariant;
  className?: string;
}

export const EditorCard: FC<EditorCardProps> = ({ editor, variant = 'default', className }) => {
  const router = useRouter();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const bioPreviewLength = 150;
  const showExpandButton = editor.bio.length > bioPreviewLength;

  const isSidebar = variant === 'sidebar';

  const emailSubject = 'ResearchHub Journal: Editorial Board Position';
  const emailBody = `Dear Dr. Dhandha,\n\nI am writing to express my interest in joining the ResearchHub Journal Editorial Board as [Chief/Associate] Editor.\n\nMy qualifications include:\n[Your qualifications]\n\nBest,\n[Your name]`;
  const applyMailto = `mailto:maulik.editor@researchhub.foundation?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const editorMailto = `mailto:${editor.socialLinks.email}`;

  const imageSize = isSidebar ? 40 : 96;
  const imageClasses = isSidebar
    ? 'rounded-full'
    : 'rounded-full border border-gray-200 bg-gray-100';

  const editorImage = (
    <Image
      src={editor.image as StaticImageData} // Cast needed because of string possibility
      alt={editor.name}
      width={imageSize}
      height={imageSize}
      className={cn(imageClasses, 'object-cover')}
      placeholder={typeof editor.image !== 'string' ? 'blur' : undefined}
    />
  );

  const handleNavigate = () => {
    if (editor.authorId) {
      router.push(`/author/${editor.authorId}`);
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-in-out',
        {
          'bg-white border border-gray-200 rounded-lg p-8 hover:bg-gray-50/50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md':
            !isSidebar,
          'border-b border-gray-200 pb-4 last:border-b-0': isSidebar,
        },
        className
      )}
    >
      {isSidebar ? (
        <>
          <div className="flex items-start space-x-3">
            <a
              onClick={handleNavigate}
              className="flex-shrink-0 mt-1 cursor-pointer"
              aria-label={`View profile for ${editor.name}`}
            >
              {editorImage}
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

          {isBioExpanded && (
            <p className="mt-3 text-xs text-gray-600 leading-relaxed">{editor.bio}</p>
          )}
        </>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="flex flex-col items-center gap-4 w-full md:basis-[120px] flex-shrink-0">
            <div
              className={cn('flex-shrink-0', editor.authorId && 'cursor-pointer')}
              onClick={handleNavigate}
            >
              {editorImage}
            </div>
            <div className="flex gap-3">
              <a
                href={!editor.authorId ? applyMailto : editorMailto}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200"
                aria-label={`Email ${editor.name}`}
              >
                <Mail className="w-4 h-4" />
              </a>
              {editor.socialLinks.linkedin && (
                <a
                  href={editor.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200"
                  aria-label={`${editor.name} LinkedIn`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {editor.socialLinks.scholar && (
                <a
                  href={editor.socialLinks.scholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200"
                  aria-label={`${editor.name} Google Scholar`}
                >
                  <GraduationCap className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn('text-lg font-medium text-gray-900 mb-1', {
                'hover:text-primary-700 hover:underline cursor-pointer': !!editor.authorId,
              })}
              onClick={handleNavigate}
              role={editor.authorId ? 'button' : undefined}
            >
              {editor.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{editor.role}</p>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
              <p>
                {isBioExpanded
                  ? editor.bio
                  : `${editor.bio.substring(0, bioPreviewLength)}${showExpandButton ? '...' : ''}`}
                {showExpandButton && !isSidebar && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="ml-1 p-0 h-auto !px-0 !py-0 text-xs font-medium align-baseline"
                  >
                    {isBioExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
