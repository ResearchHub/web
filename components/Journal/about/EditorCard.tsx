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
    : 'rounded-full border border-gray-200 bg-gray-100 flex-shrink-0';

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
        {
          'bg-white border border-gray-200 rounded-lg p-8 hover:bg-gray-50/50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-in-out':
            !isSidebar,
          'border-b border-gray-200 pb-4 last:border-b-0': isSidebar,
        },
        className
      )}
    >
      {/* Layout changes based on variant */}
      {isSidebar ? (
        // Sidebar Layout
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
              className="text-sm font-medium text-gray-800 hover:text-blue-600 block cursor-pointer"
            >
              {editor.name}
            </a>
            <p className="text-xs text-gray-500">{editor.role}</p>
            {/* Sidebar Social Links */}
            <div className="flex space-x-2 mt-1">
              <a
                href={editorMailto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600"
                aria-label="Email"
              >
                <Mail className="w-3 h-3" />
              </a>
              {editor.socialLinks.linkedin && (
                <a
                  href={editor.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-3 h-3" />
                </a>
              )}
              {editor.socialLinks.scholar && (
                <a
                  href={editor.socialLinks.scholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600"
                  aria-label="Google Scholar"
                >
                  <GraduationCap className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          {/* Sidebar Expand Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBioExpanded(!isBioExpanded)}
            className="text-gray-400 hover:text-gray-600 mt-1 !h-auto !w-auto p-0"
            aria-label={isBioExpanded ? 'Collapse bio' : 'Expand bio'}
          >
            {isBioExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      ) : (
        // Default Layout
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
          <div className="flex flex-col items-center gap-4 flex-shrink-0 md:w-auto">
            {/* Link wrapper for image in default view */}
            {editor.authorId ? (
              <Link href={`/author/${editor.authorId}`} passHref legacyBehavior>
                <a className="flex-shrink-0 cursor-pointer transition-shadow duration-200 hover:shadow-sm rounded-full">
                  {editorImage}
                </a>
              </Link>
            ) : (
              <div className="flex-shrink-0 transition-shadow duration-200 rounded-full">
                {editorImage}
              </div>
            )}
            {/* Default Social Links */}
            <div className="flex gap-3">
              <a
                href={!editor.authorId ? applyMailto : editorMailto} // Use applyMailto logic for placeholder
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:-translate-y-px transition-all duration-200"
                aria-label={`Email ${editor.name}`}
              >
                <Mail className="w-4 h-4" />
              </a>
              {editor.socialLinks.linkedin && (
                <a
                  href={editor.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:-translate-y-px transition-all duration-200"
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
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:-translate-y-px transition-all duration-200"
                  aria-label={`${editor.name} Google Scholar`}
                >
                  <GraduationCap className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div className="flex-grow pt-0 md:pt-2">
            {/* Default Name Element (clickable) */}
            <h3
              className={cn(`text-lg font-medium text-gray-900 mb-1`, {
                'hover:text-primary-700 hover:underline cursor-pointer': !!editor.authorId,
              })}
              onClick={handleNavigate}
              role={editor.authorId ? 'button' : undefined}
            >
              {editor.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{editor.role}</p>
            <hr className="border-t border-gray-200 mb-4" />
            {/* Default Bio Section (Expansion logic is below) */}
            <div className="text-sm text-gray-700 leading-relaxed">
              {isBioExpanded
                ? editor.bio
                : `${editor.bio.substring(0, bioPreviewLength)}${showExpandButton ? '...' : ''}`}
              {showExpandButton &&
                !isSidebar && ( // Only show text button in default view
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="ml-1 p-0 h-auto !px-0 !py-0 text-xs"
                  >
                    {isBioExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Bio section for sidebar (conditionally rendered) */}
      {isSidebar && isBioExpanded && (
        <p className="mt-2 text-xs text-gray-600 leading-relaxed">{editor.bio}</p>
      )}
    </div>
  );
};
