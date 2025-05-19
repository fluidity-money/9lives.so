import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import tradingDpmAbi from "@/config/abi/tradingDpm";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { MaxUint256 } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useAllowanceCheck } from "./useAllowanceCheck";
import { setContext } from "@sentry/nextjs";

const useClaim = ({
  shareAddr,
  tradingAddr,
  outcomeId,
  outcomes,
  isDpm,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  outcomes: Outcome[];
  isDpm?: boolean;
}) => {
  const queryClient = useQueryClient();
  const removePosition = usePortfolioStore((s) => s.removePositionValue);
  const { checkAndAprove } = useAllowanceCheck();
  const claim = async (account: Account, accountShare?: bigint) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!accountShare || isNaN(Number(accountShare)))
            throw new Error("Invalid winning shares");
          const tradingDpmContract = getContract({
            abi: tradingDpmAbi,
            address: tradingAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const tradingContract = getContract({
            abi: tradingAbi,
            address: tradingAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const claimTx = prepareContractCall({
            contract: tradingContract,
            method: "payoffCB6F2565",
            params: [outcomeId, accountShare, account.address],
          });
          const claimDpmTx = prepareContractCall({
            contract: tradingDpmContract,
            method: "payoff91FA8C2E",
            params: [outcomeId, accountShare, account.address],
          });
          await checkAndAprove({
            contractAddress: shareAddr,
            spenderAddress: tradingAddr,
            account,
            amount: accountShare,
          });
          const transaction = isDpm ? claimDpmTx : claimTx;
          setContext("claim_tx", {
            method: transaction.__preparedMethod?.name,
            callData: transaction.data,
            to: transaction.to,
            address: account.address,
          });
          await sendTransaction({
            transaction,
            account,
          });
          const outcomeIds = outcomes.map((outcome) => outcome.identifier);
          removePosition(outcomeId);
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, account],
          });
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", outcomeIds],
          });
          track(EVENTS.CLAIM_REWARD, {
            wallet: account.address,
            amount: accountShare,
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
        loading: "Claiming reward...",
        success: "Reward claimed successfully!",
        error: "Failed to claim.",
      },
    );
  return { claim };
};
export default useClaim;
