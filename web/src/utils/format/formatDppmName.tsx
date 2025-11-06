export function formatDppmTitle({
  symbol,
  price,
  end,
}: {
  symbol?: string;
  price?: string;
  end: number;
}) {
  if (!symbol || !price) throw new Error("Price metadata is null");
  return `${symbol.toUpperCase()} above $${price} on ${new Date(end).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", hourCycle: "h24", minute: "2-digit", timeZone: "UTC" })} UTC`;
}

export function formatDppmOutcomeName(name: string) {
  return name.includes("ABOVE") ||
    name.includes("Above") ||
    name.includes("above")
    ? "Up"
    : "Down";
}
