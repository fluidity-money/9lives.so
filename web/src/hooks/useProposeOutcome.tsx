import config from "@/config";
import toast from "react-hot-toast";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";
export default function useProposeOutcome({
  tradingAddr,
}: {
  tradingAddr: `0x${string}`;
}) {
  const propose = (outcomeId: `0x${string}`, account: Account) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const proposeTx = prepareContractCall({
            contract: config.contracts.infra,
            method: "call",
            params: [tradingAddr, outcomeId, account.address],
          });
          const receipt = await sendTransaction({
            transaction: proposeTx,
            account,
          });
          res(receipt.transactionHash);
        } catch (error) {
          rej(error);
        }
      }),
      {
        loading: "Proposing outcome...",
        success: "Outcome proposed successfully!",
        error: "Failed to propose outcome.",
      },
    );
  return { propose };
}
