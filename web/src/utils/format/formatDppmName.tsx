export default function formatDppmName({
  symbol,
  price,
  end,
}: {
  symbol: string;
  price: string;
  end: number;
}) {
  return `${symbol} above $${price} on ${new Date(end).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", hourCycle: "h24", minute: "2-digit", timeZone: "UTC" })} UTC`;
}
