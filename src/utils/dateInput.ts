/** Formats an ISO datetime string for an <input type="datetime-local">,
 * rendered in the viewer's local time. */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Converts a local <input type="datetime-local"> value back to a UTC ISO
 * datetime string for storage. */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
