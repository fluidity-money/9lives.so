import config from "@/config";

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

function getNextOpenDate(
  market: typeof config.simpleMarkets.btc,
  openH: number,
  openM: number,
  offsetDays: number,
) {
  const now = new Date();

  const baseDateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: market.tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(baseDateParts.find((p) => p.type === "year")!.value);
  const month = Number(baseDateParts.find((p) => p.type === "month")!.value);
  const day = Number(baseDateParts.find((p) => p.type === "day")!.value);

  const targetDate = new Date(
    Date.UTC(year, month - 1, day + offsetDays, openH, openM, 0, 0),
  );

  const targetDateInMarketParts = new Intl.DateTimeFormat("en-US", {
    timeZone: market.tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(targetDate);

  const tYear = Number(
    targetDateInMarketParts.find((p) => p.type === "year")!.value,
  );
  const tMonth = Number(
    targetDateInMarketParts.find((p) => p.type === "month")!.value,
  );
  const tDay = Number(
    targetDateInMarketParts.find((p) => p.type === "day")!.value,
  );
  const tHour = Number(
    targetDateInMarketParts.find((p) => p.type === "hour")!.value,
  );
  const tMinute = Number(
    targetDateInMarketParts.find((p) => p.type === "minute")!.value,
  );
  const tSecond = Number(
    targetDateInMarketParts.find((p) => p.type === "second")!.value,
  );

  const localDate = new Date(
    Date.UTC(tYear, tMonth - 1, tDay, tHour, tMinute, tSecond),
  );
  const offsetMs = localDate.getTime() - targetDate.getTime();

  return targetDate.getTime() - offsetMs;
}

export function calcNextMarketOpen(
  marketKey: keyof typeof config.simpleMarkets,
): number {
  const market = config.simpleMarkets[marketKey];
  const now = new Date();

  if (market.openDays.length === 0) {
    return now.getTime();
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: market.tz,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const hour = +parts.find((p) => p.type === "hour")!.value;
  const minute = +parts.find((p) => p.type === "minute")!.value;
  const dayStr = parts.find((p) => p.type === "weekday")!.value;

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
    return Date.now();
  }

  const [openH, openM] = market.openHours[0].split(":").map(Number);

  const currentMinutes = hour * 60 + minute;
  const openMinutes = openH * 60 + openM;

  if (market.openDays.includes(weekday) && currentMinutes < openMinutes) {
    return getNextOpenDate(market, openH, openM, 0);
  }

  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (weekday + offset) % 7;
    if (market.openDays.includes(nextDay)) {
      return getNextOpenDate(market, openH, openM, offset);
    }
  }

  return Date.now();
}
