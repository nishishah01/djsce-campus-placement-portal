/**
 * Formats a deadline string for display.
 * Handles both old format ("YYYY-MM-DD") and new format ("YYYY-MM-DD HH:MM IST").
 *
 * Examples:
 *   "2025-05-30"               → "30 May 2025"
 *   "2025-05-30 15:00 IST"     → "30 May 2025, 3:00 PM IST"
 */
export function formatDeadline(deadline: string): string {
  if (!deadline) return "—";

  // New format: "YYYY-MM-DD HH:MM IST"
  const withTimeMatch = deadline.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*IST$/i);
  if (withTimeMatch) {
    const [, datePart, timePart] = withTimeMatch;
    const dt = new Date(`${datePart}T${timePart}:00`);
    const date = dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const time = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${date}, ${time} IST`;
  }

  // Legacy date-only format: "YYYY-MM-DD"
  const dt = new Date(deadline);
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Returns true if the deadline has passed (used for filtering active jobs).
 * Works for both date-only and date+time formats.
 */
export function isDeadlinePassed(deadline: string): boolean {
  if (!deadline) return false;

  const withTimeMatch = deadline.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*IST$/i);
  if (withTimeMatch) {
    const [, datePart, timePart] = withTimeMatch;
    return new Date(`${datePart}T${timePart}:00`) < new Date();
  }

  return new Date(deadline) < new Date();
}
