import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { parseUnits } from "viem";
import { useAllowanceCheck } from "./useAllowanceCheck";
import { useWriteContract } from "wagmi";
const useSell = ({
  shareAddr,
  tradingAddr,
  campaignId,
  outcomeId,
  outcomes,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  campaignId: `0x${string}`;
  outcomes: Outcome[];
}) => {
  const queryClient = useQueryClient();
  const { checkAndAprove } = useAllowanceCheck();
  const { mutateAsync: writeContract } = useWriteContract();
  const sell = async (address: string, share: number, fusdc: number) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const usdAmount = parseUnits(
            fusdc.toFixed(config.contracts.decimals.fusdc),
            config.contracts.decimals.fusdc,
          );
          const shareAmount = parseUnits(
            share.toFixed(config.contracts.decimals.shares),
            config.contracts.decimals.shares,
          );

          const sharesToBurn = shareAmount;
          const minShareOut = BigInt(Math.floor(Number(sharesToBurn) * 0.95));
          const maxShareBurned = sharesToBurn;

          await checkAndAprove({
            contractAddress: shareAddr,
            spenderAddress: config.contracts.buyHelper2.address,
            amount: shareAmount,
            address,
          });

          await writeContract({
            ...config.contracts.buyHelper2,
            functionName: "burn",
            args: [
              tradingAddr,
              outcomeId,
              usdAmount,
              sharesToBurn,
              minShareOut,
              maxShareBurned,
              address as `0x${string}`,
            ],
          });
          const outcomeIds = outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, address],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharePrices", tradingAddr, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
          });
          queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId],
          });
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", address, outcomeIds],
          });
          track(EVENTS.BURN, {
            amount: fusdc,
            sharesToBurn,
            minShareOut,
            maxShareBurned,
            type: "sellWithContract",
            outcomeId,
            shareAddr,
            tradingAddr,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Selling shares...",
        success: "Shares sold successfully!",
        error: (e: unknown) =>
          `Create failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );

  return { sell };
};

export default useSell;
