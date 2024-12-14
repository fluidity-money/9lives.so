import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  toSerializableTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { MaxUint256, Signature } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Outcome } from "@/types";
import { track, EVENTS } from "@/utils/analytics";

const EmptyBytes32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const useBuy = ({
  shareAddr,
  tradingAddr,
  outcomeId,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
}) => {
  const queryClient = useQueryClient();
  const buy = async (account: Account, fusdc: number, outcomes: Outcome[]) =>
    toast.promise(
      new Promise(async (res, rej) => {
        try {
          const amount = toUnits(
            fusdc.toString(),
            config.contracts.decimals.fusdc,
          );
          const tradingContract = getContract({
            abi: tradingAbi,
            address: tradingAddr,
            client: config.thirdweb.client,
            chain: config.chains.currentChain,
          });
          const checkAmmReturnTx = prepareContractCall({
            contract: config.contracts.lens,
            method: "getLongtailQuote",
            params: [shareAddr, true, amount, MaxUint256],
          });
          const check9liveReturnTx = prepareContractCall({
            contract: tradingContract,
            method: "quoteC0E17FC7",
            params: [outcomeId, amount],
          });
          const mintWith9LivesTx = (
            signature: string,
            accountAddress: string,
          ) => {
            const { v, r, s } = Signature.from(signature);
            const deadline = Date.now();
            return prepareContractCall({
              contract: tradingContract,
              method: "mintPermitE90275AB",
              params: [
                outcomeId,
                amount,
                accountAddress,
                BigInt(deadline),
                v,
                r as `0x${string}`,
                s as `0x${string}`,
              ],
            });
          };
          const mintWithAMMTx = prepareContractCall({
            contract: config.contracts.amm,
            method: "swap904369BE",
            params: [outcomeId, true, amount, BigInt(Number.MAX_SAFE_INTEGER)],
          });
          const [returnAmm, return9lives] = await Promise.all<bigint>([
            simulateTransaction({
              transaction: checkAmmReturnTx,
              account,
            }),
            simulateTransaction({
              transaction: check9liveReturnTx,
              account,
            }),
          ]);
          const useAmm = returnAmm > return9lives;
          if (useAmm) {
            return sendTransaction({
              transaction: mintWithAMMTx,
              account,
            });
          } else if (account.signTransaction) {
            const approveCallTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "approve",
              params: [tradingAddr, MaxUint256],
            });
            const serializedTx = await toSerializableTransaction({
              transaction: approveCallTx,
            });
            const signature = await account.signTransaction(serializedTx);
            return sendTransaction({
              transaction: mintWith9LivesTx(signature, account.address),
              account,
            });
          } else {
            const allowanceTx = prepareContractCall({
              contract: config.contracts.fusdc,
              method: "allowance",
              params: [account.address, tradingAddr],
            });
            const allowance = (await simulateTransaction({
              transaction: allowanceTx,
              account,
            })) as bigint;
            if (amount > allowance) {
              const approveTx = prepareContractCall({
                contract: config.contracts.fusdc,
                method: "approve",
                params: [tradingAddr, amount],
              });
              await sendTransaction({
                transaction: approveTx,
                account,
              });
            }
            const mintTx = prepareContractCall({
              contract: tradingContract,
              method: "mintPermitE90275AB",
              // if deadline is zero, following params are not evaluated
              // so it become a standard mint without permit
              params: [
                outcomeId,
                amount,
                account.address,
                BigInt(0),
                0,
                EmptyBytes32,
                EmptyBytes32,
              ],
            });
            await sendTransaction({
              transaction: mintTx,
              account,
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["positions", tradingAddr, outcomes, account],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "sharePrices",
              tradingAddr,
              outcomes.map((o) => o.identifier),
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["chances", tradingAddr, outcomes[0].identifier],
          });
          queryClient.invalidateQueries({
            queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
          });
          track(EVENTS.MINT, {
            wallet: account.address,
            amount: fusdc,
            outcomeId,
            shareAddr,
            tradingAddr,
          });
          res(null);
        } catch (e) {
          rej(e);
        }
      }),
      {
        loading: "Buying shares...",
        success: "Shares bought successfully!",
        error: "Failed to buy.",
      },
    );

  return { buy };
};

export default useBuy;
