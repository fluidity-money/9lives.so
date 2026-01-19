import config from "@/config";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { useState } from "react";
import toast from "react-hot-toast";
import { useWriteContract } from "wagmi";

export default function useSarpSignaller(tradingAddr: `0x${string}`) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const { mutateAsync: writeContract } = useWriteContract();
  const request = async (address: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          setIsLoading(true);
          await checkAndSwitchChain();
          await writeContract({
            ...config.contracts.sarpSignaller,
            functionName: "request",
            args: [tradingAddr, address as `0x${string}`],
          });
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
