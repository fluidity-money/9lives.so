import {
  ninelivesMint,
  requestEoaForAddress,
  createAccount,
  requestPublicKey,
  requestSecret,
} from "@/providers/graphqlClient";
import { hasCreated } from "../providers/graphqlClient";
import useSignForPermit from "./useSignForPermit";
import { CampaignDetail, DppmMetadata, SimpleCampaignDetail } from "@/types";
import config from "@/config";
import toast from "react-hot-toast";
import { EVENTS, track } from "@/utils/analytics";
import { useQueryClient } from "@tanstack/react-query";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePublicClient, useSignMessage } from "wagmi";
import { maxUint256, parseUnits } from "viem";
import { parseSignature } from "viem";

const SECRET_KEY = "9lives-account-secret";
type SignMessage = ({ message }: { message: string }) => Promise<`0x${string}`>;
function encodeNonceBE(nonce: number): string {
  const buf = new Uint8Array(4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, nonce, false);
  return Buffer.from(buf).toString("hex");
}

function storeSecret(secret: string, wallet: string) {
  const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
  const FIVE_MINS = 1000 * 60 * 5;
  window.localStorage.setItem(
    `${SECRET_KEY}-${wallet.toLowerCase()}`,
    JSON.stringify({
      secret,
      expireAt: new Date(Date.now() + ONE_MONTH - FIVE_MINS).toUTCString(),
    }),
  );
}

export const create = async (address: string, signMessage: SignMessage) => {
  const publicKey = await requestPublicKey();
  const message = `New Superposition account: ${publicKey}, authority contract: ${config.NEXT_PUBLIC_ACCOUNT_AUTHORITY_ADDR.toLowerCase().slice(2)}`;
  const signature = await signMessage({ message });
  const { r, s, v } = parseSignature(signature);
  const response = await createAccount({
    eoaAddr: address.slice(2),
    r: r.slice(2),
    s: s.slice(2),
    v: Number(v),
  });
  if (!response) {
    throw new Error("Account creation failed");
  }
  storeSecret(response.secret, address);
  return response.secret;
};

export const isCreated = async (address: string) => {
  return await hasCreated(address);
};

export const getSecret = async (address: string, signMessage: SignMessage) => {
  const publicKey = await requestPublicKey();
  const nonce = Math.floor(Math.random() * 0x7fffffff);
  const nonceHex = encodeNonceBE(nonce);
  const message = publicKey + nonceHex;
  const signature = await signMessage({ message });
  const { r, s, v } = parseSignature(signature);
  const secret = await requestSecret({
    eoaAddr: address.slice(2),
    nonce,
    s: s.slice(2),
    r: r.slice(2),
    v: Number(v),
  });
  if (!secret) {
    throw new Error("Account secret is not retreived");
  }
  storeSecret(secret, address);
  return secret;
};

export const checkAndSetSecret = async (
  address: string,
  signMessage: SignMessage,
) => {
  const secretObj = window.localStorage.getItem(
    `${SECRET_KEY}-${address.toLowerCase()}`,
  );
  let secret: null | string = null;
  if (!secretObj) {
    const isAccountCreated = await isCreated(address);
    if (isAccountCreated) {
      secret = await getSecret(address, signMessage);
    } else {
      secret = await create(address, signMessage);
    }
  } else {
    const secretParsed = JSON.parse(secretObj) as {
      secret: string;
      expireAt: string;
    };
    if (new Date() > new Date(secretParsed.expireAt)) {
      secret = await getSecret(address, signMessage);
    } else {
      secret = secretParsed.secret;
    }
  }
  return secret;
};

export default function useAccount({
  data,
  shareAddr,
  outcomeId,
  openFundModal,
}: {
  data: CampaignDetail | SimpleCampaignDetail;
  shareAddr: string;
  outcomeId: string;
  openFundModal: () => void;
}) {
  const account = useAppKitAccount();
  const { mutateAsync: signMessage } = useSignMessage();
  const { signForPermit } = useSignForPermit(account.address);
  const queryClient = useQueryClient();
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const publicClient = usePublicClient();
  const buy = async (
    fusdc: number,
    referrer: string,
    dppmMetadata?: DppmMetadata,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) throw new Error("No wallet is connected");
          if (!publicClient) throw new Error("No public client is set");
          const secret = await checkAndSetSecret(account.address, signMessage);
          if (!secret) throw new Error("No secret is set");
          await checkAndSwitchChain();
          const amount = parseUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );
          const userBalance = await publicClient.readContract({
            ...config.contracts.fusdc,
            functionName: "balanceOf",
            args: [account.address as `0x${string}`],
          });

          if (amount > userBalance) {
            openFundModal();
            throw new Error("You dont have enough USDC.");
          }
          const spender = await requestEoaForAddress(account.address);
          const allowance = await publicClient.readContract({
            ...config.contracts.fusdc,
            functionName: "allowance",
            args: [account.address as `0x${string}`, spender as `0x${string}`],
          });
          type Permit = {
            permitR: string;
            permitS: string;
            permitV: number;
            deadline: number;
          };
          let permit: undefined | Permit = undefined;
          if (BigInt(amount) > allowance) {
            const deadline = Math.floor(Date.now() / 1000) + 3600;
            const { r, s, v } = await signForPermit({
              spender,
              amountToSpend: maxUint256,
              deadline,
            });
            permit = {
              permitR: r,
              permitS: s,
              permitV: Number(v),
              deadline,
            };
          }
          type ResponseType = {
            response?: { status: number };
            data?: any;
          };
          const result = (await ninelivesMint({
            amount: amount.toString(),
            outcome: outcomeId,
            poolAddress: data.poolAddress,
            referrer,
            secret,
            eoaAddress: account.address,
            permit,
          })) as ResponseType;
          if (result?.response?.status === 401) {
            const newSecret = await getSecret(account.address, signMessage);
            const result2 = (await ninelivesMint({
              amount: amount.toString(),
              outcome: outcomeId,
              poolAddress: data.poolAddress,
              referrer,
              secret: newSecret,
              eoaAddress: account.address,
              permit,
            })) as ResponseType;
            if (result2.response?.status !== 200) {
              throw new Error(
                `code ${result2.response?.status}. Contact support`,
              );
            }
          } else if (result.response?.status !== 200) {
            throw new Error(`code ${result.response?.status}. Contact support`);
          }
          res(result.response);
          track(EVENTS.MINT, {
            amount,
            outcomeId,
            shareAddr,
            tradingAddr: data.poolAddress,
            type: "buyWithAccount",
            ...(dppmMetadata ?? {}),
          });
          const outcomeIds = data.outcomes.map((o) => o.identifier);
          queryClient.invalidateQueries({
            queryKey: [
              "positions",
              data.poolAddress,
              data.outcomes,
              account.address,
              data.isDpm,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharePrices", data.poolAddress, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "returnValue",
              shareAddr,
              data.poolAddress,
              outcomeId,
              amount,
            ],
          });
          if (data.priceMetadata) {
            const period = getPeriodOfCampaign(data as SimpleCampaignDetail);
            queryClient.invalidateQueries({
              queryKey: [
                "simpleCampaign",
                data.priceMetadata.baseAsset,
                period,
              ],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: ["campaign", data.identifier],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["positionHistory", account.address, outcomeIds],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "tokensWithBalances",
              account.address,
              config.destinationChain.id,
            ],
          });
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: (e) =>
          `Buy error: ${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );

  return { buy, checkAndSetSecret, getSecret };
}
