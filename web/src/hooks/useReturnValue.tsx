import config from "@/config";
import { thirdwebClient } from "@/config/app";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { formatUnits, MaxUint256 } from "ethers";
import { Account } from "thirdweb/wallets";
import { useQuery } from "@tanstack/react-query";

export default function useReturnValue({
  account,
  shareAddr,
  outcomeId,
  campaignId,
  tradingAddr,
  share,
}: {
  account?: Account;
  shareAddr: string;
  campaignId: `0x${string}`;
  tradingAddr: string;
  outcomeId: `0x${string}`;
  share: number;
}) {
  const amount = toUnits(share.toString(), config.contracts.decimals.fusdc);
  const checkAmmReturnTx = prepareContractCall({
    contract: config.contracts.lens,
    method: "getLongtailQuote",
    params: [shareAddr, true, amount, MaxUint256],
  });
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: thirdwebClient,
    chain: config.chains.superpositionTestnet,
  });
  const check9liveReturnTx = (receipent: string) =>
    prepareContractCall({
      contract: tradingContract,
      method: "quote101CBE35",
      params: [outcomeId, amount, receipent],
    });
  async function getReturns(account: Account) {
    return await Promise.all<bigint>([
      simulateTransaction({
        transaction: checkAmmReturnTx,
        account,
      }),
      simulateTransaction({
        transaction: check9liveReturnTx(account.address),
        account,
      }),
    ]);
  }
  return useQuery({
    queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, share],
    queryFn: async () => {
      const [returnAmm, return9lives] = await getReturns(account!);
      const returnValue =
        return9lives && returnAmm
          ? BigInt(Math.max(Number(return9lives), Number(returnAmm)))
          : (return9lives ?? returnAmm);
      const estimatedReturn = returnValue
        ? formatUnits(returnValue, config.contracts.decimals.fusdc)
        : "0";

      return estimatedReturn;
    },
    enabled: !!account,
  });
}
