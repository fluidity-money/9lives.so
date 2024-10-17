import config from "@/config";
import { thirdwebClient } from "@/config/app";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  toSerializableTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { Signature } from "ethers";
import { Account } from "thirdweb/wallets";

const useBuy = ({
  tradingAddr,
  account,
  outcomeId,
  value,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  outcomeId: `0x${string}`;
  value: number;
}) => {
  const amount = toUnits(value.toString(), config.contracts.decimals.fusdc);
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: thirdwebClient,
    chain: config.chains.superpositionTestnet,
  });
  const checkAmmReturnTx = prepareContractCall({
    contract: config.contracts.amm,
    method: "quote72E2ADE7",
    params: [tradingAddr, true, amount, BigInt(amount)],
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
  const mintWithAMMTx = () =>
    prepareContractCall({
      contract: config.contracts.amm,
      method: "swap904369BE",
      params: [outcomeId, true, amount, amount],
    });

  const buy = async () => {
    if (!account) {
      console.error("No account is connected");
      return;
    }
    const returnAmmP = sendTransaction({
      transaction: checkAmmReturnTx,
      account,
    }).catch((e) => e);
    const return9livesP = sendTransaction({
      transaction: check9liveReturnTx(account.address),
      account,
    }).catch((e) => e);
    // can be improve with batch txs (need to measure)
    const [returnAmm, return9lives] = await Promise.all([
      returnAmmP,
      return9livesP,
    ]);
    const useAmm = returnAmm > return9lives;
    if (useAmm) {
      return sendTransaction({
        transaction: mintWithAMMTx(),
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

  return buy;
};

export default useBuy;
