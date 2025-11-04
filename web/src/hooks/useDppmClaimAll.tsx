import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import toast from "react-hot-toast";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useDppmClaimAll({
  tradingAddr,
}: {
  tradingAddr: `0x${string}`;
}) {
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: config.thirdweb.client,
    chain: config.destinationChain,
  });

  const claimAll = async (account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const estimateTx = prepareContractCall({
            contract: tradingContract,
            method: "dppmPayoffForAll58633B6E",
            params: [account?.address],
          });
          const response = await sendTransaction({
            transaction: estimateTx,
            account,
          });
          res(response.transactionHash);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Claiming...",
        success: "Claimed successfully",
        error: (e: unknown) =>
          `Claim failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );

  return { claimAll };
}
