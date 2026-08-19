import { DAY_NAMES, DEFAULT_TIMEZONE } from "@/lib/constants";

export type OpeningHourLike = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function getRestaurantStatus(
  hours: OpeningHourLike[],
  timezone = DEFAULT_TIMEZONE,
  now = new Date(),
) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const dayOfWeek = dayMap[weekday] ?? 0;
  const current = hour * 60 + minute;
  const today = hours.find((item) => item.dayOfWeek === dayOfWeek);
  const yesterday = hours.find((item) => item.dayOfWeek === (dayOfWeek + 6) % 7);

  if (yesterday && !yesterday.isClosed && yesterday.openTime && yesterday.closeTime) {
    const yesterdayOpen = minutes(yesterday.openTime);
    const yesterdayClose = minutes(yesterday.closeTime);
    if (yesterdayClose <= yesterdayOpen && current < yesterdayClose) {
      return { isOpen: true, label: `Açık · ${yesterday.closeTime}'e kadar` };
    }
  }

  if (!today || today.isClosed || !today.openTime || !today.closeTime) {
    return { isOpen: false, label: "Bugün kapalı" };
  }

  const open = minutes(today.openTime);
  const close = minutes(today.closeTime);
  const isOvernight = close <= open;
  const isOpen = isOvernight ? current >= open : current >= open && current < close;

  if (isOpen) return { isOpen: true, label: `Açık · ${today.closeTime}'e kadar` };
  if (current < open) return { isOpen: false, label: `Kapalı · ${today.openTime}'da açılıyor` };
  return { isOpen: false, label: "Şu anda kapalı" };
}

export function formatOpeningHour(hour: OpeningHourLike) {
  if (hour.isClosed || !hour.openTime || !hour.closeTime) return "Kapalı";
  return `${hour.openTime}–${hour.closeTime}`;
}

export function dayName(index: number) {
  return DAY_NAMES[index] ?? "Bilinmeyen gün";
}
