import config from "@/config";
import { requestPaymaster as requestPaymasterMutation } from "@/providers/graphqlClient";
import { ethers, MaxUint256, ZeroAddress } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import useSignForPermit from "./useSignForPermit";
import useSignForPaymaster from "./useSignForPaymaster";
import useProfile from "./useProfile";
import { PaymasterType } from "@/types";
export default function useRequestPaymaster() {
  type MutationType = Parameters<typeof requestPaymasterMutation>[0];
  type InputType = Pick<
    MutationType,
    "amountToSpend" | "opType" | "outcome" | "tradingAddr" | "minimumBack"
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
    const deadline = Math.floor(Date.now() / 1000) + 3600;
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
          deadline,
        });
        permitR = r;
        permitS = s;
        permitV = v;
      }
    }
    const convertOpTypeToEnum: Record<InputType["opType"], PaymasterType> = {
      MINT: PaymasterType.MINT,
      ADD_LIQUIDITY: PaymasterType.ADD_LIQUIDITY,
      REMOVE_LIQUIDITY: PaymasterType.REMOVE_LIQUIDITY,
      SELL: PaymasterType.BURN,
    } as const;
    const { r, s, v, nonce } = await signForPaymaster({
      tradingAddr: params.tradingAddr,
      amountToSpend: BigInt(params.amountToSpend),
      referrer: profile?.settings?.refererr || ZeroAddress,
      outcomeId: params.outcome,
      deadline,
      minimumBack: BigInt(0),
      type: convertOpTypeToEnum[params.opType],
    });
    const ticketId = await requestPaymasterMutation({
      r: r.slice(2),
      s: s.slice(2),
      v,
      permitR: permitR ? permitR.slice(2) : "",
      permitS: permitS ? permitS.slice(2) : "",
      permitV,
      owner,
      minimumBack: params.minimumBack,
      outcome: params.outcome ? params.outcome.slice(2) : undefined,
      originatingChainId,
      opType: params.opType,
      deadline,
      amountToSpend: params.amountToSpend,
      tradingAddr: params.tradingAddr,
      nonce: nonce.toString(),
    });
    return ticketId;
  };
  return { requestPaymaster };
}
