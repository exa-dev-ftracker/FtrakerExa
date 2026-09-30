import type { H3Event } from "h3";
import Users from "~/server/model/users";

export function normalizeTimezone(tz?: string | null): string {
  if (!tz || typeof tz !== "string") return "UTC";
  const trimmed = tz.trim();
  const upper = trimmed.toUpperCase();
  if (upper === "WIB" || upper.includes("WIB")) return "Asia/Jakarta";
  if (upper === "WITA" || upper.includes("WITA")) return "Asia/Makassar";
  if (upper === "WIT" || upper.includes("WIT")) return "Asia/Jayapura";
  if (upper === "SGT" || upper.includes("SGT")) return "Asia/Singapore";
  if (upper === "JST" || upper.includes("JST")) return "Asia/Tokyo";
  if (upper === "EST" || upper.includes("EST")) return "America/New_York";
  if (upper === "PST" || upper.includes("PST")) return "America/Los_Angeles";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    return "UTC";
  }
}

export function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    fractionalSecondDigits: 3,
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10) - 1, // 0-indexed
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    millisecond: parseInt(map.fractionalSecond || "0", 10),
  };
}

export function createUtcFromZoned(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
  timeZone = "UTC"
): Date {
  const guessUtc = new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
  const parts = getZonedParts(guessUtc, timeZone);
  const actualZonedAsUtc = Date.UTC(
    parts.year,
    parts.month,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond
  );
  const offset = actualZonedAsUtc - guessUtc.getTime();
  return new Date(guessUtc.getTime() - offset);
}

export async function resolveUserTimezone(events: H3Event, userId?: string): Promise<string> {
  const query = getQuery(events) as { timezone?: string };
  if (query.timezone && query.timezone.trim()) {
    return normalizeTimezone(query.timezone);
  }

  const headerTz = getHeader(events, "x-timezone") || getHeader(events, "timezone");
  if (headerTz && headerTz.trim()) {
    return normalizeTimezone(headerTz);
  }

  if (userId) {
    try {
      const user = await Users.findById(userId).select("timezone").lean();
      if (user?.timezone) {
        return normalizeTimezone(user.timezone);
      }
    } catch {
      // fallback
    }
  }

  return "UTC";
}
