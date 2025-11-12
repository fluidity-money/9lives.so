export default function isMarketOpen({
  openDays,
  openHours,
  tz,
}: {
  openDays: number[];
  openHours: string[];
  tz: string;
}) {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");
  const weekdayPart = parts.find((p) => p.type === "weekday");

  if (!hourPart || !minutePart || !weekdayPart) {
    return false;
  }

  const hour = Number(hourPart.value);
  const minute = Number(minutePart.value);

  const dayStr = weekdayPart.value;
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = dayMap[dayStr];
  if (weekday === undefined) {
    return false;
  }

  if (!openDays.includes(weekday)) return false;

  const [openH, openM] = openHours[0].split(":").map(Number);
  const [closeH, closeM] = openHours[1].split(":").map(Number);

  const currentMinutes = hour * 60 + minute;
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
