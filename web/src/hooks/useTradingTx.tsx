import config from "@/config";
import { thirdwebClient } from '@/config/app'
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { Signature } from "ethers";
import { Account } from "thirdweb/wallets";

const useTradingTx = ({
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
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: thirdwebClient,
    chain: config.chains.superpositionTestnet,
  });
  const prepare = (signature: string, accountAddress: string) => {
    const { v, r, s } = Signature.from(signature);
    const deadline = Date.now();
    return prepareContractCall({
      contract: tradingContract,
      method: "mintPermit",
      params: [
        outcomeId,
        toUnits(value.toString(), config.decimals.fusdc),
        BigInt(deadline),
        accountAddress,
        v,
        r as `0x${string}`,
        s as `0x${string}`,
      ],
    });
  };
  const tx = async (signature: string) => {
    if (!account) {
      console.error("No account is connected");
      return;
    }
    const transaction = await prepare(signature, account.address);
    return sendTransaction({
      transaction,
      account,
    });
  };
  return tx;
};

export default useTradingTx;
