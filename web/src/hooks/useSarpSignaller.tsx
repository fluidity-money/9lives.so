import config from "@/config";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { useState } from "react";
import toast from "react-hot-toast";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useSarpSignaller(tradingAddr: `0x${string}`) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const request = async (account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          setIsLoading(true);
          const requestTx = prepareContractCall({
            contract: config.contracts.sarpSignaller,
            method: "request",
            params: [tradingAddr, account?.address],
          });
          await checkAndSwitchChain();
          await sendTransaction({ transaction: requestTx, account });
          res(null);
          setIsSuccess(true);
        } catch (e) {
          rej(e);
        } finally {
          setIsLoading(false);
        }
      }),
      {
        loading: "Requesting resolvement",
        success: "Requested successfully!",
        error: (e: unknown) =>
          `Request failed. ${e instanceof Error ? e.message : e instanceof String ? e : `Unknown error: ${JSON.stringify(e)}`}`,
      },
    );
  return { request, isLoading, isSuccess };
}
