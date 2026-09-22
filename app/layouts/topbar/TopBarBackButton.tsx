import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/pro-solid-svg-icons';

interface TopBarBackButtonProps {
  onClick: () => void;
  variant: 'mobile' | 'desktop';
  /** What the arrow does, for assistive tech; "Back" unless the host says otherwise. */
  label?: string;
}

export const TopBarBackButton = ({ onClick, variant, label = 'Back' }: TopBarBackButtonProps) => {
  const isMobile = variant === 'mobile';

  return (
    <div className={isMobile ? 'block tablet:!hidden mr-1' : 'hidden tablet:!block mr-1'}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FontAwesomeIcon
          icon={faArrowLeftLong}
          className={isMobile ? 'text-gray-700' : 'text-gray-700 mt-1'}
          fontSize={isMobile ? 18 : 23}
        />
      </button>
    </div>
  );
};
