import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CampaignDetail, DppmMetadata, SimpleCampaignDetail } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { MaxUint256 } from "ethers";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import { useAppKitAccount } from "@reown/appkit/react";
import { parseUnits } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

const useBuy = ({
  shareAddr,
  outcomeId,
  data,
  openFundModal,
}: {
  shareAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  data: CampaignDetail | SimpleCampaignDetail;
  openFundModal: () => void;
}) => {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const queryClient = useQueryClient();
  const account = useAppKitAccount();
  const publicClient = usePublicClient();
  const { mutateAsync: writeContract } = useWriteContract();
  const buy = async (
    fusdc: number,
    referrer: string,
    dppmMetadata?: DppmMetadata,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) throw new Error("No active account");
          if (!publicClient) throw new Error("No public client is set");
          await checkAndSwitchChain();
          const amount = parseUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );
          const userBalance = await publicClient.readContract({
            ...config.contracts.fusdc,
            functionName: "balanceOf",
            args: [account.address as `0x${string}`],
          });
          if (amount > userBalance) {
            openFundModal();
            throw new Error("You dont have enough USDC.");
          }
          const allowance = await publicClient.readContract({
            ...config.contracts.fusdc,
            functionName: "allowance",
            args: [
              account.address as `0x${string}`,
              config.contracts.buyHelper2.address as `0x${string}`,
            ],
          });

          if (amount > allowance) {
            await writeContract({
              ...config.contracts.fusdc,
              functionName: "approve",
              args: [
                config.contracts.buyHelper2.address as `0x${string}`,
                MaxUint256,
              ],
            });
          }

          const mintWith9LivesTx = (simulatedShare?: bigint) => {
            const minSharesOut = simulatedShare
              ? (simulatedShare * BigInt(95)) / BigInt(100)
              : BigInt(0);
            const maxSharesOut = simulatedShare
              ? (simulatedShare * BigInt(105)) / BigInt(100)
              : MaxUint256;
            return {
              ...(config.contracts
                .buyHelper2 as typeof config.contracts.buyHelper2),
              functionName: "mint",
              args: [
                data.poolAddress as `0x${string}`,
                config.contracts.fusdc.address,
                outcomeId as `0x${string}`,
                minSharesOut,
                maxSharesOut,
                amount,
                referrer as `0x${string}`,
                BigInt(0), //rebate
                BigInt(Math.floor(Date.now() / 1000) + 60 * 30), // deadline
                account.address as `0x${string}`,
              ],
            } as const;
          };
          const simulatedShares = await publicClient.simulateContract(mintWith9LivesTx());

          await writeContract(mintWith9LivesTx(simulatedShares.result));

          const outcomeIds = data.outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: [
              "positions",
              data.poolAddress,
              data.outcomes,
              account,
              data.isDpm,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharePrices", data.poolAddress, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "returnValue",
              shareAddr,
              data.poolAddress,
              outcomeId,
              fusdc,
            ],
          });
          if (data.priceMetadata) {
            const period = getPeriodOfCampaign(data as SimpleCampaignDetail);
            queryClient.invalidateQueries({
              queryKey: [
                "simpleCampaign",
                data.priceMetadata.baseAsset,
                period,
              ],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: ["campaign", data.identifier],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", account.address, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "tokensWithBalances",
              account?.address,
              config.destinationChain.id,
            ],
          });
          track(EVENTS.MINT, {
            amount: fusdc,
            outcomeId,
            shareAddr,
            tradingAddr: data.poolAddress,
            ...(dppmMetadata ?? {}),
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: (e) => `${e?.message ?? "Unknown error"}`,
      },
    );

  return { buy };
};

export default useBuy;
