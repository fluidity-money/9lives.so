import config from "@/config";
import { requestPaymaster as requestPaymasterMutation } from "@/providers/graphqlClient";
import useSignForPermit from "./useSignForPermit";
import useSignForPaymaster from "./useSignForPaymaster";
import useProfile from "./useProfile";
import { PaymasterType } from "@/types";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { usePublicClient } from "wagmi";
import { maxUint256, zeroAddress } from "viem";
export default function useRequestPaymaster() {
  type MutationType = Parameters<typeof requestPaymasterMutation>[0];
  type InputType = Pick<
    MutationType,
    | "amountToSpend"
    | "opType"
    | "outcome"
    | "tradingAddr"
    | "minimumBack"
    | "outgoingChainEid"
    | "referrer"
  >;
  const account = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { signForPermit } = useSignForPermit(account.address);
  const { signForPaymaster } = useSignForPaymaster(chainId, account.address);
  const publicClient = usePublicClient();
  const { data: profile } = useProfile(account?.address);
  const requestPaymaster = async (params: InputType) => {
    if (!account?.address) throw new Error("No account is connected");
    if (!chainId) throw new Error("No chain id is detected");
    if (!publicClient) throw new Error("Public client is not set");
    const owner = account.address;
    const originatingChainId = chainId.toString();
    let permitR = "";
    let permitS = "";
    let permitV = 0;
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    if (Number(params.amountToSpend) > 0) {
      const allowance = await publicClient.readContract({
        ...config.contracts.fusdc,
        functionName: "allowance",
        args: [
          account.address as `0x${string}`,
          config.contracts.paymaster.address,
        ],
      });
      if (BigInt(params.amountToSpend) > allowance) {
        const { r, s, v } = await signForPermit({
          spender: config.NEXT_PUBLIC_PAYMASTER_ADDR,
          amountToSpend: maxUint256,
          deadline,
        });
        permitR = r;
        permitS = s;
        permitV = Number(v);
      }
    }
    const convertOpTypeToEnum: Record<InputType["opType"], PaymasterType> = {
      MINT: PaymasterType.MINT,
      ADD_LIQUIDITY: PaymasterType.ADD_LIQUIDITY,
      REMOVE_LIQUIDITY: PaymasterType.REMOVE_LIQUIDITY,
      SELL: PaymasterType.BURN,
      WITHDRAW_USDC: PaymasterType.WITHDRAW_USDC,
    } as const;
    const { r, s, v, nonce } = await signForPaymaster({
      tradingAddr: params.tradingAddr,
      amountToSpend: BigInt(params.amountToSpend),
      referrer: profile?.settings?.refererr || zeroAddress,
      outcomeId: params.outcome,
      deadline,
      minimumBack: BigInt(params.minimumBack),
      type: convertOpTypeToEnum[params.opType],
    });
    const ticketId = await requestPaymasterMutation({
      r: r.slice(2),
      s: s.slice(2),
      v: Number(v),
      permitR: permitR ? permitR.slice(2) : "",
      permitS: permitS ? permitS.slice(2) : "",
      permitV,
      owner,
      minimumBack: params.minimumBack,
      outcome: params.outcome ? params.outcome.slice(2) : undefined,
      originatingChainId,
      opType: params.opType,
      outgoingChainEid: params.outgoingChainEid,
      deadline,
      amountToSpend: params.amountToSpend,
      tradingAddr: params.tradingAddr,
      nonce: nonce.toString(),
    });
    const amountMap: Record<typeof params.opType, string> = {
      MINT: params.amountToSpend,
      SELL: params.minimumBack,
      ADD_LIQUIDITY: params.amountToSpend,
      REMOVE_LIQUIDITY: params.minimumBack,
      WITHDRAW_USDC: params.minimumBack,
    };
    return { ticketId, amount: amountMap[params.opType] };
  };
  return { requestPaymaster };
}
