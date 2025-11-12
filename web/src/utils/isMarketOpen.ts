import config from "@/config";

type Market = {
  openDays: number[];
  openHours: string[]; // ["HH:MM","HH:MM"]
  tz: string;
};

function marketNowParts(tz: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  return {
    hour: Number(parts.find((p) => p.type === "hour")!.value),
    minute: Number(parts.find((p) => p.type === "minute")!.value),
    weekdayStr: parts.find((p) => p.type === "weekday")!.value,
    year: Number(parts.find((p) => p.type === "year")!.value),
    month: Number(parts.find((p) => p.type === "month")!.value),
    day: Number(parts.find((p) => p.type === "day")!.value),
  };
}

export default function isMarketOpen(market: Market) {
  const { openDays, openHours, tz } = market;
  if (!openDays || openDays.length === 0 || !openHours || openHours.length < 2)
    return true; // treat as always open

  const { hour, minute, weekdayStr } = marketNowParts(tz);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = dayMap[weekdayStr];
  if (weekday === undefined || !openDays.includes(weekday)) return false;

  const [openH, openM] = openHours[0].split(":").map(Number);
  const [closeH, closeM] = openHours[1].split(":").map(Number);

  const nowMin = hour * 60 + minute;
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  if (openMin <= closeMin) {
    return nowMin >= openMin && nowMin < closeMin;
  } else {
    return nowMin >= openMin || nowMin < closeMin;
  }
}

function epochForMarketLocal(
  tz: string,
  y: number,
  m: number,
  d: number,
  h: number,
  mi: number,
) {
  const target = new Date(Date.UTC(y, m - 1, d, h, mi, 0, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(target);
  const ty = Number(parts.find((p) => p.type === "year")!.value);
  const tm = Number(parts.find((p) => p.type === "month")!.value);
  const td = Number(parts.find((p) => p.type === "day")!.value);
  const th = Number(parts.find((p) => p.type === "hour")!.value);
  const tmi = Number(parts.find((p) => p.type === "minute")!.value);
  const ts = Number(parts.find((p) => p.type === "second")!.value);
  const local = new Date(Date.UTC(ty, tm - 1, td, th, tmi, ts));
  return target.getTime() - (local.getTime() - target.getTime());
}

export function calcNextMarketOpen(
  marketKey: keyof typeof config.simpleMarkets,
): number {
  const market = config.simpleMarkets[marketKey] as Market;
  if (!market || !market.openDays || market.openDays.length === 0)
    return Date.now();

  const now = new Date();
  const { hour, minute, weekdayStr, year, month, day } = marketNowParts(
    market.tz,
    now,
  );

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = dayMap[weekdayStr];
  if (weekday === undefined) return Date.now();

  const [openH, openM] = market.openHours[0].split(":").map(Number);
  const [closeH, closeM] = market.openHours[1].split(":").map(Number);

  const nowMin = hour * 60 + minute;
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  // If market is open now, return now
  const isOpenNow =
    market.openDays.includes(weekday) &&
    (openMin <= closeMin
      ? nowMin >= openMin && nowMin < closeMin
      : nowMin >= openMin || nowMin < closeMin);
  if (isOpenNow) return now.getTime();

  // If today is open and we're before opening (non-cross-midnight), return today's open epoch
  if (
    market.openDays.includes(weekday) &&
    openMin <= closeMin &&
    nowMin < openMin
  ) {
    return epochForMarketLocal(market.tz, year, month, day, openH, openM);
  }

  // Otherwise find next open day
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (weekday + offset) % 7;
    if (market.openDays.includes(nextDay)) {
      return epochForMarketLocal(
        market.tz,
        year,
        month,
        day + offset,
        openH,
        openM,
      );
    }
  }

  return Date.now();
}
