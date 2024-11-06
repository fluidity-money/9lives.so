import config from "@/config";
import { formatUnits } from "ethers";
import useDetails from "./useDetails";

export default function useInvestedAmount({
  tradingAddr,
  outcomeIds,
}: {
  tradingAddr: `0x${string}`;
  outcomeIds: `0x${string}`[];
}) {
  const { data } = useDetails({
    tradingAddr,
    outcomeIds,
  });
  return formatUnits(
    data?.totalInvestment ?? 0,
    config.contracts.decimals.fusdc,
  );
}
