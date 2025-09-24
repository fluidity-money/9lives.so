import usePriceEvents from "@/hooks/usePriceEvents";
import { Outcome } from "@/types";
import getAmmPrices from "@/utils/getAmmPrices";
import {
  LineChart,
  ResponsiveContainer,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";

export default function PriceChart({
  outcomes,
  poolAddress,
}: {
  poolAddress: string;
  outcomes: Outcome[];
}) {
  const { data: priceEvents, isSuccess } = usePriceEvents(poolAddress);
  const colors = [
    "#5dd341",
    "#f96565",
    "#3fb5e2",
    "#e7aa4e",
    "#8b48e3",
    "#0C0C0C",
    "#9be2fd",
    "#b8b7b7",
  ];

  if (isSuccess && 2 > priceEvents.length) {
    return null;
  }

  const data = priceEvents
    ?.filter((i) => !!i)
    .map((i) => {
      const event = {
        timestamp: i.createdAt,
        month: new Date(i.createdAt * 1000).toLocaleString("default", {
          month: "long",
        }),
      };
      const prices = getAmmPrices(i.shares);
      const outcomes = i.shares.reduce(
        (acc, v) => {
          if (v) {
            acc[`0x${v.identifier}`] = +(
              (prices?.get(`0x${v.identifier}`) ?? 0.5) * 100
            ).toFixed(1);
          }
          return acc;
        },
        {} as Record<string, number>,
      );
      return Object.assign(event, outcomes);
    });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 40, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#aaa" strokeDasharray="1 3" vertical={false} />
        {outcomes.map((o, idx) => (
          <Line
            key={o.identifier}
            dot={false}
            type="monotone"
            dataKey={o.identifier}
            stroke={colors[idx]}
            strokeWidth={2}
            name={o.name}
          />
        ))}
        <YAxis
          tick={{
            fontFamily: "var(--font-chicago)",
            fontSize: 12,
            fill: "#0C0C0C",
          }}
          axisLine={{ stroke: "#0C0C0C", strokeWidth: 1 }}
          orientation="right"
          width="auto"
          tickFormatter={(value) => `${value}%`}
        />
        <Legend
          align="left"
          verticalAlign="top"
          wrapperStyle={{ fontFamily: "var(--font-chicago)", fontSize: 12 }}
        />
        <XAxis
          tick={{
            fontFamily: "var(--font-chicago)",
            fontSize: 12,
            fill: "#0C0C0C",
          }}
          dataKey="timestamp"
          axisLine={{ stroke: "#0C0C0C", strokeWidth: 1 }}
          tickFormatter={(ts) => {
            const date = new Date(ts * 1000);
            return date.toLocaleString("default", { month: "short" });
          }}
        />
        <Tooltip
          labelFormatter={(ts: any) => {
            const date = new Date(ts * 1000);
            return date.toLocaleString("default", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
          formatter={(c) => `${c}%`}
          contentStyle={{
            borderColor: "#0C0C0C",
            borderRadius: 3,
            boxShadow: "5px 5px 0 rgba(12, 12, 12, 0.20)",
          }}
          labelStyle={{ fontFamily: "var(--font-chicago)", fontSize: 12 }}
          itemStyle={{ fontFamily: "var(--font-chicago)", fontSize: 12 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
