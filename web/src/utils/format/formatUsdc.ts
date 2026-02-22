import config from "@/config";
import { formatUnits } from "viem";

export default function formatFusdc(
  amount: number | string | bigint,
  digits = 0,
) {
  return Number(
    formatUnits(
      BigInt(Math.trunc(Number(amount))),
      config.contracts.decimals.fusdc,
    ),
  ).toFixed(digits);
}
