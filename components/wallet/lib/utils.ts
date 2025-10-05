/**
 * Wallet Popup Utilities
 * Handles cleanup of wallet popups on mobile devices
 */

/**
 * Check if an element is modal-like based on its styles
 */
export const isModalLikeElement = (el: HTMLElement): boolean => {
  const styles = globalThis.getComputedStyle(el);
  const isPositioned = styles.position === 'fixed' || styles.position === 'absolute';
  const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden';
  const hasHighZIndex = Number.parseInt(styles.zIndex || '0', 10) > 40;

  return isPositioned && isVisible && hasHighZIndex;
};

/**
 * Check if an element is a wallet popup (not the deposit modal)
 */
export const isWalletPopupElement = (el: HTMLElement): boolean => {
  const text = el.textContent || '';
  const isDepositModal = text.includes('Deposit RSC');
  const hasWalletText =
    text.includes('Redirecting to Coinbase Wallet') || text.includes('Open in Wallet');

  return hasWalletText && !isDepositModal;
};

/**
 * Hide positioned parent elements (up to 3 levels)
 */
export const hidePositionedParents = (el: HTMLElement): void => {
  let parent = el.parentElement;
  let depth = 0;
  const MAX_DEPTH = 3;

  while (parent && parent !== document.body && depth < MAX_DEPTH) {
    const parentStyles = globalThis.getComputedStyle(parent);
    const isPositioned = parentStyles.position === 'fixed' || parentStyles.position === 'absolute';

    if (isPositioned) {
      parent.style.display = 'none';
      break;
    }

    parent = parent.parentElement;
    depth++;
  }
};

/**
 * Close all wallet popups on the page
 * Used when returning from mobile wallet to clean up stuck overlays
 */
export const closeWalletPopups = (): void => {
  const elements = document.querySelectorAll('div, aside, section');

  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue;

    if (isModalLikeElement(el) && isWalletPopupElement(el)) {
      el.style.display = 'none';
      hidePositionedParents(el);
    }
  }
};
