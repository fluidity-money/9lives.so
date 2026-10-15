"use client";

import config from "@/config";
import type { PricePoint } from "@/types";
import { Liveline } from "liveline";
import { memo, useMemo } from "react";

function RfqhubPriceChart({ prices }: { prices: PricePoint[] }) {
  const data = useMemo(
    () =>
      prices.map((point) => ({
        time: point.timestamp / 1000,
        value: point.price,
      })),
    [prices],
  );
  const latest = data[data.length - 1];
  const windowSecs =
    data.length < 2
      ? 30
      : Math.min(900, Math.max(30, Math.ceil(latest.time - data[0].time)));
  return (
    <div style={{ height: 300 }}>
      <Liveline
        data={data}
        value={latest?.value ?? 0}
        loading={!latest}
        theme="light"
        color="#16A34A"
        window={windowSecs}
        grid={false}
        formatValue={(value) =>
          `$${value.toFixed(config.simpleMarkets.btc.decimals)}`
        }
        formatTime={(time) =>
          new Date(time * 1000).toLocaleString("default", {
            hour: "numeric",
            minute: "2-digit",
          })
        }
      />
    </div>
  );
}

export default memo(RfqhubPriceChart);
