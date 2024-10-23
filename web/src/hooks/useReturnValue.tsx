import config from "@/config";
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
import { useCallback, useMemo } from "react";

export default function useReturnValue({
  account,
  shareAddr,
  outcomeId,
  tradingAddr,
  share,
}: {
  account?: Account;
  shareAddr: string;
  tradingAddr: string;
  outcomeId: `0x${string}`;
  share: number;
}) {
  const amount = toUnits(share.toString(), config.contracts.decimals.fusdc);
  const checkAmmReturnTx = useMemo(
    () =>
      prepareContractCall({
        contract: config.contracts.lens,
        method: "getLongtailQuote",
        params: [shareAddr, true, amount, MaxUint256],
      }),
    [amount, shareAddr],
  );
  const tradingContract = useMemo(
    () =>
      getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.chains.superpositionTestnet,
      }),
    [tradingAddr],
  );
  const check9liveReturnTx = useCallback(
    (receipent: string) =>
      prepareContractCall({
        contract: tradingContract,
        method: "quote101CBE35",
        params: [outcomeId, amount, receipent],
      }),
    [amount, outcomeId, tradingContract],
  );
  const getReturns = useCallback(
    async function (account: Account) {
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
    },
    [check9liveReturnTx, checkAmmReturnTx],
  );
  return useQuery({
    queryKey: [
      "returnValue",
      shareAddr,
      tradingAddr,
      outcomeId,
      share,
      account,
    ],
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
