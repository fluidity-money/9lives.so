import config from "@/config";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toUnits,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { MaxUint256, MinInt256 } from "ethers";
import ERC20Abi from "@/config/abi/erc20";
const useSell = ({
  shareAddr,
  tradingAddr,
  campaignId,
  outcomeId,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  campaignId: `0x${string}`;
}) => {
  const queryClient = useQueryClient();
  const sell = async (account: Account, fusdc: number, outcomes: Outcome[]) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const shareContract = getContract({
            abi: ERC20Abi,
            address: shareAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const balanceOfTx = prepareContractCall({
            contract: shareContract,
            method: "balanceOf",
            params: [account?.address],
          });
          const balance = await simulateTransaction({
            transaction: balanceOfTx,
            account,
          });
          const minShareOut = balance;
          const maxShareOut = balance;
          const allowanceTx = prepareContractCall({
            contract: shareContract,
            method: "allowance",
            params: [account.address, config.contracts.buyHelper.address],
          });
          const allowance = await simulateTransaction({
            transaction: allowanceTx,
            account,
          });
          if (balance > allowance) {
            const approveTx = prepareContractCall({
              contract: shareContract,
              method: "approve",
              params: [config.contracts.buyHelper.address, balance],
            });
            await sendTransaction({
              transaction: approveTx,
              account,
            });
          }
          const burnTx = prepareContractCall({
            contract: config.contracts.buyHelper,
            method: "burn",
            params: [tradingAddr, outcomeId, maxShareOut, minShareOut],
          });
          await sendTransaction({
            transaction: burnTx,
            account,
          });
          const outcomeIds = outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, account],
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
            queryKey: ["positionHistory", outcomeIds],
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
