import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { MaxUint256 } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import ERC20Abi from "@/config/abi/erc20";
import { track, EVENTS } from "@/utils/analytics";
import { usePortfolioStore } from "@/stores/portfolioStore";

const useClaim = ({
  shareAddr,
  tradingAddr,
  outcomeId,
  outcomes,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  outcomes: Outcome[];
}) => {
  const queryClient = useQueryClient();
  const removePosition = usePortfolioStore((s) => s.removePositionValue);
  const claim = async (account: Account, accountShare?: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!accountShare || isNaN(Number(accountShare)))
            throw new Error("Invalid winning shares");
          const shares = toUnits(
            accountShare,
            config.contracts.decimals.shares,
          );
          const shareContract = getContract({
            abi: ERC20Abi,
            address: shareAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const approveTx = prepareContractCall({
            contract: shareContract,
            method: "approve",
            params: [tradingAddr, MaxUint256],
          });
          const tradingContract = getContract({
            abi: tradingAbi,
            address: tradingAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const claimTx = prepareContractCall({
            contract: tradingContract,
            method: "payoff91FA8C2E",
            params: [outcomeId, shares, account.address],
          });
          await sendTransaction({
            transaction: approveTx,
            account,
          });
          await sendTransaction({
            transaction: claimTx,
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
