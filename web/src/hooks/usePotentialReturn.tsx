import { formatUnits } from "ethers";
import useDetails from "./useDetails";
import config from "@/config";
interface usePotentialReturnProps {
  tradingAddr: `0x${string}`;
  outcomeIds: `0x${string}`[];
  outcomeId: `0x${string}`;
  fusdc: number;
  share: number;
}
export default function usePotentialReturn({
  tradingAddr,
  outcomeIds,
  outcomeId,
  fusdc,
  share,
}: usePotentialReturnProps) {
  const { data } = useDetails({
    tradingAddr,
    outcomeIds,
  });
  if (!data) return 0;
  const outcomeDetails = data.outcomes.find((o) => o.id === outcomeId)!;
  const totalInvestment = formatUnits(
    data.totalInvestment,
    config.contracts.decimals.fusdc,
  );
  const sharesOfOutcome = formatUnits(
    outcomeDetails.share,
    config.contracts.decimals.shares,
  );
  return (
    ((Number(totalInvestment) + fusdc) / (Number(sharesOfOutcome) + share)) *
    share
  );
}
