import config from "@/config";
import { requestPaymaster as requestPaymasterMutation } from "@/providers/graphqlClient";
import { ethers, MaxUint256, ZeroAddress } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import useSignForPermit from "./useSignForPermit";
import useSignForPaymaster from "./useSignForPaymaster";
import useProfile from "./useProfile";
export default function useRequestPaymaster() {
  type MutationType = Parameters<typeof requestPaymasterMutation>[0];
  type InputType = Pick<
    MutationType,
    "amountToSpend" | "opType" | "outcome" | "tradingAddr"
  >;
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { signForPermit } = useSignForPermit();
  const { signForPaymaster } = useSignForPaymaster();
  const { data: profile } = useProfile(account?.address);
  const requestPaymaster = async (params: InputType) => {
    if (!account?.address) throw new Error("No account is connected");
    if (!chain) throw new Error("No chain id is detected");
    const owner = account.address;
    const originatingChainId = chain.id.toString();
    let permitR = "";
    let permitS = "";
    let permitV = 0;
    if (params.amountToSpend) {
      const allowanceTx = prepareContractCall({
        contract: config.contracts.fusdc,
        method: "allowance",
        params: [account.address, config.contracts.buyHelper2.address],
      });
      const allowance = (await simulateTransaction({
        transaction: allowanceTx,
        account,
      })) as bigint;
      if (MaxUint256 > allowance) {
        const { r, s, v } = await signForPermit({
          spender: config.NEXT_PUBLIC_PAYMASTER_ADDR,
          amountToSpend: MaxUint256,
        });
        permitR = r;
        permitS = s;
        permitV = v;
      }
    }
    const { r, s, v } = await signForPaymaster({
      tradingAddr: params.tradingAddr,
      amountToSpend: BigInt(params.amountToSpend),
      referrer: profile?.settings?.refererr ?? ZeroAddress,
      outcomeId: params.outcome,
      minimumBack: BigInt(0),
      type: params.opType,
    });
    const provider = new ethers.JsonRpcProvider(chain.rpc);
    const nonce = await provider.getTransactionCount(account.address);
    const ticketId = await requestPaymasterMutation({
      r,
      s,
      v,
      permitR,
      permitS,
      permitV,
      owner,
      originatingChainId,
      opType: params.opType,
      amountToSpend: params.amountToSpend,
      tradingAddr: params.tradingAddr,
      nonce: nonce.toString(),
    });
    return ticketId;
  };
  return { requestPaymaster };
}
