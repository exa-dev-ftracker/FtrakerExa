import { normalizeTimezone, getZonedParts, createUtcFromZoned } from "./timezone";

export default function useSelectedView(periode: string, timeZone: string = "UTC") {
  const tz = normalizeTimezone(timeZone);
  const now = new Date();
  const p = getZonedParts(now, tz);

  const lastPeriode = () => {
    let start: Date | undefined;
    let end: Date | undefined;
    switch (periode) {
      case "Day": {
        start = createUtcFromZoned(p.year, p.month, p.day - 1, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, p.month, p.day - 1, 23, 59, 59, 999, tz);
        return { start, end };
      }
      case "Month": {
        const lastDayOfPrevMonth = new Date(p.year, p.month, 0).getDate();
        start = createUtcFromZoned(p.year, p.month - 1, 1, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, p.month - 1, lastDayOfPrevMonth, 23, 59, 59, 999, tz);
        return { start, end };
      }
      case "Year": {
        start = createUtcFromZoned(p.year - 1, 0, 1, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year - 1, 11, 31, 23, 59, 59, 999, tz);
        return { start, end };
      }
      case "Week": {
        const d = new Date(Date.UTC(p.year, p.month, p.day));
        const dayOfWeek = (d.getUTCDay() + 6) % 7; // 0=Mon, 6=Sun
        start = createUtcFromZoned(p.year, p.month, p.day - dayOfWeek - 7, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, p.month, p.day - dayOfWeek - 1, 23, 59, 59, 999, tz);
        return { start, end };
      }
    }
    return { start, end };
  };

  const currentPeriode = () => {
    let start: Date | undefined;
    let end: Date | undefined;
    switch (periode) {
      case "Day": {
        start = createUtcFromZoned(p.year, p.month, p.day, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, p.month, p.day, 23, 59, 59, 999, tz);
        return { start, end };
      }
      case "Month": {
        const lastDayOfMonth = new Date(p.year, p.month + 1, 0).getDate();
        start = createUtcFromZoned(p.year, p.month, 1, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, p.month, lastDayOfMonth, 23, 59, 59, 999, tz);
        return { start, end };
      }
      case "Year": {
        start = createUtcFromZoned(p.year, 0, 1, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, 11, 31, 23, 59, 59, 999, tz);
        return { start, end };
      }
      case "Week": {
        const d = new Date(Date.UTC(p.year, p.month, p.day));
        const dayOfWeek = (d.getUTCDay() + 6) % 7;
        start = createUtcFromZoned(p.year, p.month, p.day - dayOfWeek, 0, 0, 0, 0, tz);
        end = createUtcFromZoned(p.year, p.month, p.day - dayOfWeek + 6, 23, 59, 59, 999, tz);
        return { start, end };
      }
    }
    return { start, end };
  };

  return { lastPeriode, currentPeriode };
}