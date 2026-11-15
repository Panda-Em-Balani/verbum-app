// Dates are handled as local-day keys ("YYYY-MM-DD"), never UTC, so "today" matches the
// person's own calendar.

const pad = (n) => String(n).padStart(2, "0");

export function localDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(dateKey, n) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return localDateKey(new Date(y, m - 1, d + n));
}

// Milliseconds from `date` to the next local midnight (always at least 1).
export function msUntilMidnight(date) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return Math.max(1, next.getTime() - date.getTime());
}
