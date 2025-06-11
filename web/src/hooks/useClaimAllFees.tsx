import config from "@/config";
import { EVENTS, track } from "@/utils/analytics";
import { useCallback } from "react";
import toast from "react-hot-toast";
import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useClaimAllFees() {
  const claim = useCallback(
    async (
      addresses: string[],
      account: Account,
      simulate: boolean = false,
    ) => {
      const claimTx = prepareContractCall({
        contract: config.contracts.claimantHelper,
        method: "claim",
        params: [addresses],
      });
      if (addresses.length === 0) throw new Error("No addresses to claim.");
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
            await sendTransaction({
              transaction: claimTx,
              account,
            });
            track(EVENTS.CLAIM_ALL_FEES, {
              wallet: account.address,
              addresses,
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
    [],
  );
  const displayClaimFeesBtn = useCallback(
    async (address: string, account: Account) => {
      const fees = await claim([address], account, true);
      if (fees) return Number(fees[0]) > 0;
      return false;
    },
    [claim],
  );

  return { claim, displayClaimFeesBtn };
}
