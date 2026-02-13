import { isDeadlineInFuture } from "@/utils/date";
import { GrantStatus } from "@/types/grant";

/**
 * Determines if a grant is currently active based on its status and end date.
 * 
 * @param status The status of the grant (e.g., 'OPEN', 'CLOSED')
 * @param endDate Optional ISO timestamp string for the grant's deadline
 * @returns boolean indicating if the grant is active
 */
export function isGrantActive(status: GrantStatus, endDate?: string): boolean {
  return status === "OPEN" && (endDate ? isDeadlineInFuture(endDate) : true);
}
