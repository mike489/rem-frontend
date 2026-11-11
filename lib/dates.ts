// Date formatting and <input type="datetime-local"> conversion.
//
// Laravel stores and returns times in UTC (ISO 8601). They are shown in TIME_ZONE
// (NEXT_PUBLIC_TIME_ZONE), or in the server's / browser's own zone when it isn't set.
// Setting it keeps server-rendered and browser-rendered times identical.
import { TIME_ZONE } from "./config";

/** "Nov 10, 2026" */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en", { dateStyle: "medium", timeZone: TIME_ZONE });
}

/** "Nov 10, 2026, 3:42 PM" */
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en", { dateStyle: "medium", timeStyle: "short", timeZone: TIME_ZONE });
}

/** "Thu, Nov 12 · 10:30 AM" — for visit times. */
export function formatVisitTime(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: TIME_ZONE });
  const time = date.toLocaleTimeString("en", { timeStyle: "short", timeZone: TIME_ZONE });
  return `${day} · ${time}`;
}

/** Wall-clock parts of `date` in TIME_ZONE (or the local zone). */
function partsInZone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** ISO time -> "2026-11-12T10:30", the value format of <input type="datetime-local">. */
export function toDateTimeInput(iso: string | null | undefined) {
  if (!iso) return "";
  const p = partsInZone(new Date(iso));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** "2026-11-12T10:30" (wall-clock time in TIME_ZONE) -> UTC ISO string, or null if not a valid value. */
export function fromDateTimeInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  // The zone's offset at that moment: how far its wall clock is from UTC.
  const p = partsInZone(new Date(asUtc));
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - asUtc;
  return new Date(asUtc - offset).toISOString();
}
