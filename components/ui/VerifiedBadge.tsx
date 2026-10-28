import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBadgeCheck } from '@fortawesome/pro-solid-svg-icons';
import { faBadgeCheck as faBadgeCheckLight } from '@fortawesome/pro-light-svg-icons';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { GraduationCap, IdCard, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { Tooltip } from '@/components/ui/Tooltip';
import { useVerification } from '@/contexts/VerificationContext';
import { useAuthorVerificationMethods } from '@/hooks/useAuthor';
import type { VerificationMethod } from '@/types/authorProfile';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOrganization?: boolean;
  className?: string;
  showTooltip?: boolean;
  variant?: 'solid' | 'outlined';
  verificationMethods?: VerificationMethod[];
  /** Loads the verification methods on hover when they aren't passed. */
  authorId?: number;
}

const METHOD_DETAILS: Record<VerificationMethod, { label: string; icon: React.ReactNode }> = {
  PERSONA: {
    label: 'Identity verified by Persona',
    icon: <IdCard className="w-4 h-4 text-blue-500" />,
  },
  MANUAL: {
    label: 'Identity verified by ResearchHub',
    icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
  },
  X: {
    label: 'Identity verified by X',
    icon: <FontAwesomeIcon icon={faXTwitter} className="w-4 h-4 text-gray-900" />,
  },
  EDU_EMAIL: {
    label: 'Verified academic email',
    icon: <GraduationCap className="w-4 h-4 text-blue-500" />,
  },
};

export function VerifiedBadge({
  size = 'md',
  isOrganization = false,
  className,
  showTooltip = false,
  variant = 'solid',
  verificationMethods,
  authorId,
}: VerifiedBadgeProps) {
  const { openVerificationModal } = useVerification();
  const [{ methods, isLoading }, loadVerificationMethods] = useAuthorVerificationMethods(
    authorId,
    verificationMethods
  );

  // Map sizes to pixel values
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const icon = variant === 'outlined' ? faBadgeCheckLight : faBadgeCheck;

  const badge = (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        sizeMap[size],
        showTooltip && 'cursor-pointer',
        className
      )}
      onPointerEnter={showTooltip ? loadVerificationMethods : undefined}
    >
      <FontAwesomeIcon
        icon={icon}
        className={clsx('w-full h-full', isOrganization ? 'text-purple-500' : 'text-blue-500')}
      />
    </span>
  );

  if (!showTooltip) {
    return badge;
  }

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openVerificationModal();
  };

  const renderVerificationMethods = () => {
    if (isLoading) {
      return <div className="text-sm text-gray-500 animate-pulse">Loading verifications...</div>;
    }
    if (!methods?.length) {
      return <div className="text-sm text-gray-600">This user has verified their identity</div>;
    }
    return (
      <ul className="mt-1 space-y-1.5">
        {methods.map((method) => (
          <li key={method} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="flex w-4 justify-center shrink-0">{METHOD_DETAILS[method].icon}</span>
            {METHOD_DETAILS[method].label}
          </li>
        ))}
      </ul>
    );
  };

  const tooltipContent = (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faBadgeCheck} className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="text-left flex-1">
        <div className="font-semibold text-gray-900  text-base">Verified Profile</div>
        {renderVerificationMethods()}
        <a
          href="#"
          onClick={handleLearnMoreClick}
          className="inline-block mt-1 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Learn more about verification
        </a>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} width="w-96" position="top">
      {badge}
    </Tooltip>
  );
}
