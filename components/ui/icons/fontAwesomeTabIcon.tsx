import type { ComponentType } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/** A Font Awesome icon as a tab's icon: a component that takes a class name. */
export function fontAwesomeTabIcon(icon: IconDefinition): ComponentType<{ className?: string }> {
  return function FontAwesomeTabIcon({ className }: { className?: string }) {
    return <FontAwesomeIcon icon={icon} className={className} />;
  };
}
