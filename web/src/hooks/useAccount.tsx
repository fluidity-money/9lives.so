import {
  ninelivesMint,
  requestEoaForAddress,
  createAccount,
  requestPublicKey,
  requestSecret,
} from "@/providers/graphqlClient";
import { MaxUint256, Signature } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { hasCreated } from "../providers/graphqlClient";
import useSignForPermit from "./useSignForPermit";
import { CampaignDetail, DppmMetadata, SimpleCampaignDetail } from "@/types";
import config from "@/config";
import { prepareContractCall, simulateTransaction, toUnits } from "thirdweb";
import toast from "react-hot-toast";
import { EVENTS, track } from "@/utils/analytics";
import { useQueryClient } from "@tanstack/react-query";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";

const SECRET_KEY = "9lives-account-secret";

function encodeNonceBE(nonce: number): string {
  const buf = new Uint8Array(4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, nonce, false);
  return Buffer.from(buf).toString("hex");
}

function storeSecret(secret: string) {
  const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
  const FIVE_MINS = 1000 * 60 * 5;
  window.localStorage.setItem(
    SECRET_KEY,
    JSON.stringify({
      secret,
      expireAt: new Date(Date.now() + ONE_MONTH - FIVE_MINS).toUTCString(),
    }),
  );
}

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
  const account = useActiveAccount();
  const { signForPermit } = useSignForPermit(config.destinationChain, account);
  const queryClient = useQueryClient();
  const { checkAndSwitchChain } = useCheckAndSwitchChain();

  const create = async () => {
    if (!account) throw new Error("No wallet is connected");
    const publicKey = await requestPublicKey();
    const signature = await account?.signMessage({ message: publicKey });
    const { r, s, v } = Signature.from(signature);
    const response = await createAccount({
      eoaAddr: account.address.slice(2),
      r: r.slice(2),
      s: s.slice(2),
      v,
    });
    if (!response) {
      throw new Error("Account creation failed");
    }
    storeSecret(response.secret);
    return response.secret;
  };

  const getSecret = async () => {
    if (!account) throw new Error("No wallet is connected");
    const publicKey = await requestPublicKey();
    const nonce = Math.floor(Math.random() * 0x7fffffff);
    const nonceHex = encodeNonceBE(nonce);
    const message = publicKey + nonceHex;
    const signature = await account?.signMessage({ message });
    const { r, s, v } = Signature.from(signature);
    const secret = await requestSecret({
      eoaAddr: account.address.slice(2),
      nonce,
      s: s.slice(2),
      r: r.slice(2),
      v,
    });
    if (!secret) {
      throw new Error("Account secret is not retreived");
    }
    storeSecret(secret);
    return secret;
  };

  const isCreated = async () => {
    if (!account) throw new Error("No wallet is connected");
    return await hasCreated(account.address);
  };

  const checkAndSetSecret = async () => {
    const secretObj = window.localStorage.getItem(SECRET_KEY);
    let secret: null | string = null;
    if (!secretObj) {
      const isAccountCreated = await isCreated();
      if (isAccountCreated) {
        secret = await getSecret();
      } else {
        secret = await create();
      }
    } else {
      const secretParsed = JSON.parse(secretObj) as {
        secret: string;
        expireAt: string;
      };
      if (new Date() > new Date(secretParsed.expireAt)) {
        secret = await getSecret();
      } else {
        secret = secretParsed.secret;
      }
    }
    return secret;
  };

  const buy = async (
    fusdc: number,
    referrer: string,
    dppmMetadata?: DppmMetadata,
  ) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          if (!account) throw new Error("No wallet is connected");
          const secret = await checkAndSetSecret();
          if (!secret) throw new Error("No secret is set");
          await checkAndSwitchChain();
          const amount = toUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          ).toString();
          const userBalanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "balanceOf",
            params: [account?.address],
          });
          const userBalance = await simulateTransaction({
            transaction: userBalanceTx,
            account,
          });
          if (amount > userBalance) {
            openFundModal();
            throw new Error("You dont have enough USDC.");
          }

          const allowanceTx = prepareContractCall({
            contract: config.contracts.fusdc,
            method: "allowance",
            params: [account.address, config.contracts.paymaster.address],
          });
          const allowance = (await simulateTransaction({
            transaction: allowanceTx,
            account,
          })) as bigint;
          type Permit = {
            permitR: string;
            permitS: string;
            permitV: number;
            deadline: number;
          };
          let permit: undefined | Permit = undefined;
          if (BigInt(amount) > allowance) {
            const spender = await requestEoaForAddress(account.address);
            const deadline = Math.floor(Date.now() / 1000) + 3600;
            const { r, s, v } = await signForPermit({
              spender,
              amountToSpend: MaxUint256,
              deadline,
            });
            permit = {
              permitR: r,
              permitS: s,
              permitV: v,
              deadline,
            };
          }
          const result = await ninelivesMint({
            amount,
            outcome: outcomeId,
            poolAddress: data.poolAddress,
            referrer,
            secret,
            eoaAddress: account.address,
            permit,
          });
          res(result);
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
              account,
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
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: (e) => `${e?.shortMessage ?? e?.message ?? "Unknown error"}`,
      },
    );

  return { buy };
}
