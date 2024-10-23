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

const useBuy = ({
  shareAddr,
  tradingAddr,
  outcomeId,
}: {
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
}) => {
  const buy = async (account: Account, share: number) => {
    const amount = toUnits(share.toString(), config.contracts.decimals.fusdc);
    const tradingContract = getContract({
      abi: tradingAbi,
      address: tradingAddr,
      client: config.thirdweb.client,
      chain: config.chains.superpositionTestnet,
    });
    const checkAmmReturnTx = prepareContractCall({
      contract: config.contracts.lens,
      method: "getLongtailQuote",
      params: [shareAddr, true, amount, MaxUint256],
    });
    const check9liveReturnTx = (receipent: string) =>
      prepareContractCall({
        contract: tradingContract,
        method: "quote101CBE35",
        params: [outcomeId, amount, receipent],
      });
    const mintWith9LivesTx = (signature: string, accountAddress: string) => {
      const { v, r, s } = Signature.from(signature);
      const deadline = Date.now();
      return prepareContractCall({
        contract: tradingContract,
        method: "mintPermitB8D681AD",
        params: [
          outcomeId,
          amount,
          BigInt(deadline),
          accountAddress,
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
        transaction: check9liveReturnTx(account.address),
        account,
      }),
    ]);
    const useAmm = returnAmm > return9lives;
    if (useAmm) {
      return sendTransaction({
        transaction: mintWithAMMTx,
        account,
      });
    } else {
      if (!account.signTransaction)
        throw new Error("Your wallet do not support signing Tx");
      const approveCallTx = prepareContractCall({
        contract: config.contracts.fusdc,
        method: "approve",
        params: [tradingAddr, BigInt(Number.MAX_SAFE_INTEGER)],
      });
      const serializedTx = await toSerializableTransaction({
        transaction: approveCallTx,
      });
      const signature = await account.signTransaction(serializedTx);
      return sendTransaction({
        transaction: mintWith9LivesTx(signature, account.address),
        account,
      });
    }
  };

  return { buy };
};

export default useBuy;
