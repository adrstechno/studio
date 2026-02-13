/**
 * Utilities for parsing and formatting punch in/out times.
 * Handles both 24-hour (HH:mm, HH:mm:ss) and 12-hour (h:mm AM/PM) formats for backward compatibility.
 */

/**
 * Parse a time string to minutes since midnight.
 * Supports: "14:30", "14:30:00", "2:30 PM", "02:30 AM"
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  // 12-hour format: "2:30 PM", "11:45 AM", "12:00 AM"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (hours === 12) hours = period === 'AM' ? 0 : 12;
    else if (period === 'PM') hours += 12;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  // 24-hour format: "14:30", "14:30:00", "09:05"
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Format a stored time string for display (24-hour HH:mm).
 * If input is already 24h or 12h, normalizes to "HH:mm".
 */
export function formatTimeForDisplay(timeStr: string): string {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes === null) return timeStr; // fallback to raw
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculate total hours between check-in and check-out.
 * Returns "H:MM" or "0:00" if invalid.
 */
export function calculateTotalHours(checkIn?: string, checkOut?: string): string {
  if (!checkIn || !checkOut) return '0:00';
  const inM = parseTimeToMinutes(checkIn);
  const outM = parseTimeToMinutes(checkOut);
  if (inM === null || outM === null) return '0:00';
  let diff = outM - inM;
  if (diff < 0) diff += 24 * 60; // next day checkout
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert "H:MM" duration string to decimal hours (e.g. "8:30" -> 8.5).
 */
export function durationToDecimalHours(durationStr: string): number {
  const [h, m] = durationStr.split(':').map(Number);
  if (isNaN(h)) return 0;
  const minutes = isNaN(m) ? 0 : m;
  return h + minutes / 60;
}
