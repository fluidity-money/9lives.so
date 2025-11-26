import config from "@/config";
import { EVENTS, track } from "@/utils/analytics";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { useCallback } from "react";
import toast from "react-hot-toast";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useClaimAllFees() {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const claim = useCallback(
    async (
      poolAddresses: string[],
      account: Account,
      simulate: boolean = false,
    ) => {
      const claimTx = prepareContractCall({
        contract: config.contracts.claimantHelper,
        method: "claim",
        params: [poolAddresses],
      });
      if (simulate) {
        const values = (await simulateTransaction({
          transaction: claimTx,
          account,
        })) as string[] | undefined;
        return values;
      }
      return toast.promise<string[] | undefined>(
        new Promise(async (res, rej) => {
          try {
            await checkAndSwitchChain();
            await sendTransaction({
              transaction: claimTx,
              account,
            });
            track(EVENTS.CLAIM_ALL_FEES, {
              poolAddresses,
            });
            res([]);
          } catch (e) {
            rej(e);
          }
        }),
        {
          loading: "Claiming fees...",
          success: "Fees claimed successfully!",
          error: "Failed to claim.",
        },
      );
    },
    [checkAndSwitchChain],
  );
  const checkClaimFees = useCallback(
    async (poolAddress: string, account: Account) => {
      const fees = await claim([poolAddress], account, true);
      return BigInt(fees?.[0] ?? 0);
    },
    [claim],
  );

  return { claim, checkClaimFees };
}
