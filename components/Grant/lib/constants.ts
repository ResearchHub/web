export const DEFAULT_GRANT_TITLE = 'Untitled RFP';

/**
 * Default application deadline for new RFPs created via the modal.
 * Uses a far-future date so modal-created RFPs are not prematurely closed;
 * authors are expected to update the deadline after publishing.
 */
export const DEFAULT_GRANT_DEADLINE = new Date('2029-12-31');
