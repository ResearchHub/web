'use client';

import { useId } from 'react';
import styles from './LivingFlask.module.css';

/**
 * What the flask is doing. Poses and loops for each live in the stylesheet;
 * changing `state` tweens between them.
 *
 * `idle` waits, `listen` leans in, `active` works head-down, and `delivered` is
 * a one-shot pop that settles back into breathing.
 */
export type FlaskState = 'idle' | 'listen' | 'active' | 'delivered';

interface LivingFlaskProps {
  readonly state: FlaskState;
  /** Rendered square. Below ~24px the face stops reading. Default: 28. */
  readonly size?: number;
  readonly className?: string;
}

/**
 * The agent's stand-in while a turn runs: a flask that breathes, blinks, and
 * works, standing in for a status label rather than sitting beside one.
 *
 * The glass and liquid take `--lf-ink` (defaulting to `currentColor`), so the
 * caller tints it by setting a text colour; `--lf-surface` is whatever shows
 * through the glass and must match the surface behind it — the panel's white.
 *
 * Decorative by design: the caller owns the accessible name, because only the
 * caller knows what the state means in its own context.
 */
export function LivingFlask({ state, size = 28, className }: LivingFlaskProps) {
  // `useId` output carries characters that a `url(#…)` reference can't take.
  const clipId = `lf-clip-${useId().replaceAll(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      className={`${styles.flask} ${className ?? ''}`}
      data-state={state}
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M 349 247 C 349 253 388 270 383 293 L 383 402 C 334 532 204 810 204 832 C 204 894 270 938 306 938 L 719 938 C 755 938 821 894 821 832 C 821 810 690 532 640 402 L 640 293 C 635 270 675 253 675 247 Z" />
        </clipPath>
      </defs>

      <g className={styles.pose}>
        <g className={styles.poseLoop}>
          <g className={styles.breath}>
            <path
              className={styles.ink}
              d="M 347 215 A 31 31 0 0 0 316 246 C 308 268 354 288 352 293 L 352 402 C 300 532 170 810 170 866 C 170 928 236 972 272 972 L 753 972 C 789 972 855 928 855 866 C 855 810 724 532 671 402 L 671 293 C 669 288 715 268 707 246 A 31 31 0 0 0 676 215 Z"
            />

            <g clipPath={`url(#${clipId})`}>
              <path
                className={styles.surface}
                d="M 349 247 C 349 253 388 270 383 293 L 383 402 C 334 532 204 810 204 832 C 204 894 270 938 306 938 L 719 938 C 755 938 821 894 821 832 C 821 810 690 532 640 402 L 640 293 C 635 270 675 253 675 247 Z"
              />
              <g className={styles.liquidWave}>
                <path
                  className={styles.ink}
                  d="M 180 562 C 280 562 340 550 380 543 C 405 538 425 536 450 540 C 510 550 560 576 610 570 C 650 566 690 556 844 556 L 844 990 L 180 990 Z"
                />
                <path
                  className={styles.sheen}
                  d="M 310 552 C 370 544 405 536 450 540 C 510 550 560 576 610 570 C 645 566 680 558 730 556"
                />
              </g>
            </g>

            <g className={styles.eyeL}>
              <g className={styles.glance}>
                <g className={styles.eye}>
                  <g className={styles.blink}>
                    <rect
                      className={styles.surface}
                      x="383"
                      y="654"
                      width="45"
                      height="118"
                      rx="22.5"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g className={styles.eyeR}>
              <g className={styles.glance}>
                <g className={styles.eye}>
                  <g className={styles.blink}>
                    <rect
                      className={styles.surface}
                      x="595"
                      y="654"
                      width="45"
                      height="118"
                      rx="22.5"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      <g className={styles.bubble1}>
        <g className={styles.bubbleFloat}>
          <circle className={styles.ink} cx="361.5" cy="147" r="31" />
        </g>
      </g>
      <g className={styles.bubble2}>
        <g className={styles.bubbleFloat}>
          <circle className={styles.ink} cx="511.5" cy="97" r="43" />
        </g>
      </g>
      <g className={styles.bubble3}>
        <g className={styles.bubbleFloat}>
          <circle className={styles.ink} cx="660.5" cy="147" r="31" />
        </g>
      </g>
    </svg>
  );
}
