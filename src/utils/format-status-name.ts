/**
 * Formats a status string for display (first character as-is, remainder lowercase).
 */
export const formatStatusName = (status: string): string => {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`;
};
