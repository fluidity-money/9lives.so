import config from "@/config";
import { formatUnits } from "ethers";

export default function formatFusdc(amount: number, digits = 0) {
  return Number(formatUnits(amount, config.contracts.decimals.fusdc)).toFixed(
    digits,
  );
}
