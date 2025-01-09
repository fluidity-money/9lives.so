import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toSerializableTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { MaxUint256, Signature } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { generateMarketId } from "@/utils/generateMarketId";

const EmptyBytes32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const useBuy = ({
  shareAddr,
  tradingAddr,
  outcomeId,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
}) => {
  const queryClient = useQueryClient();
  const buy = async (account: Account, fusdc: number, outcomes: Outcome[]) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );
          const checkAmmReturnTx = prepareContractCall({
            contract: config.contracts.lens,
            method: "getLongtailQuote",
            params: [shareAddr, true, amount, MaxUint256],
          });
          const marketId = generateMarketId(outcomes.map((o) => o.identifier));
          const mintWith9LivesTx = (minShareOut = BigInt(0)) =>
            prepareContractCall({
              contract: config.contracts.buyHelper,
              method: "mint",
              params: [
                marketId,
                config.contracts.fusdc.address,
                outcomeId,
                minShareOut,
                amount,
              ],
            });
          const mintWithAMMTx = prepareContractCall({
            contract: config.contracts.amm,
            method: "swap904369BE",
            params: [outcomeId, true, amount, BigInt(Number.MAX_SAFE_INTEGER)],
          });
          const [returnAmm, return9lives] = await Promise.all<bigint>([
            simulateTransaction({
              transaction: checkAmmReturnTx,
              account,
            }),
            simulateTransaction({
              transaction: mintWith9LivesTx(),
              account,
            }),
          ]);
          const useAmm = returnAmm > return9lives;
          if (useAmm) {
            return sendTransaction({
              transaction: mintWithAMMTx,
              account,
            });
          } else {
            const allowanceTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "allowance",
              params: [account.address, tradingAddr],
            });
            const allowance = (await simulateTransaction({
              transaction: allowanceTx,
              account,
            })) as bigint;
            if (amount > allowance) {
              const approveTx = prepareContractCall({
                contract: config.contracts.fusdc,
                method: "approve",
                params: [tradingAddr, amount],
              });
              await sendTransaction({
                transaction: approveTx,
                account,
              });
            }
            // sets minimum share to %90 of expected return shares
            const minShareOut = (return9lives * BigInt(9)) / BigInt(10);
            await sendTransaction({
              transaction: mintWith9LivesTx(minShareOut),
              account,
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, account],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "sharePrices",
              tradingAddr,
              outcomes.map((o) => o.identifier),
            ],
          });
          const outcomeIds = outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: ["details", tradingAddr, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
          });
          track(EVENTS.MINT, {
            wallet: account.address,
            amount: fusdc,
            outcomeId,
            shareAddr,
            tradingAddr,
          });
          res(null);
        } catch (e) {
          console.error("buying: ", e);
          rej(e);
        }
      }),
      {
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: "Failed to buy.",
      },
    );

  return { buy };
};

export default useBuy;
