import config from "@/config";
import { BigNumberish, formatUnits } from "ethers";

export default function formatFusdc(amount: BigNumberish, digits = 0) {
  return Number(formatUnits(amount, config.contracts.decimals.fusdc)).toFixed(
    digits,
  );
}
