import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { formatUnits, MaxUint256 } from "ethers";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export default function useReturnValue({
  shareAddr,
  outcomeId,
  tradingAddr,
  fusdc,
}: {
  shareAddr: string;
  tradingAddr: string;
  outcomeId: `0x${string}`;
  fusdc: number;
}) {
  const amount = toUnits(fusdc.toString(), config.contracts.decimals.fusdc);
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
        chain: config.chains.arbitrumOneMainnet,
      }),
    [tradingAddr],
  );
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const check9liveReturnTx = useMemo(
    () =>
      prepareContractCall({
        contract: tradingContract,
        method: "quote101CBE35",
        params: [outcomeId, amount, zeroAddress],
      }),
    [amount, outcomeId, tradingContract],
  );
  const getReturns = useCallback(
    async function () {
      return await Promise.all<bigint>([
        simulateTransaction({
          transaction: checkAmmReturnTx,
        }),
        simulateTransaction({
          transaction: check9liveReturnTx,
        }),
      ]);
    },
    [check9liveReturnTx, checkAmmReturnTx],
  );
  return useQuery({
    queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
    queryFn: async () => {
      const [returnAmm, return9lives] = await getReturns();
      const returnValue =
        return9lives && returnAmm
          ? BigInt(Math.max(Number(return9lives), Number(returnAmm)))
          : (return9lives ?? returnAmm);
      const estimatedReturn = returnValue
        ? formatUnits(returnValue, config.contracts.decimals.fusdc)
        : "0";

      return estimatedReturn;
    },
  });
}
