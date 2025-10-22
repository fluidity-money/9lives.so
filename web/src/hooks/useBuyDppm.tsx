import config from "@/config";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";
import { useActiveAccount } from "thirdweb/react";
import { MaxUint256 } from "ethers";

const useBuyDppm = ({
  shareAddr,
  tradingAddr,
  campaignId,
  outcomeId,
  outcomes,
  openFundModal,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  outcomes: Outcome[];
  campaignId: `0x${string}`;
  openFundModal: () => void;
}) => {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const buyDppm = async (fusdc: number, referrer: string) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account) throw new Error("No active account");

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

  return { buyDppm };
};

export default useBuyDppm;
