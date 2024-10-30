import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";

export default function useInvestedAmount({
  tradingAddr,
}: {
  tradingAddr: `0x${string}`;
}) {
  return useQuery({
    queryKey: ["investedAmount", tradingAddr],
    queryFn: async () => {
      const balanceOfTx = prepareContractCall({
        contract: config.contracts.fusdc,
        method: "balanceOf",
        params: [tradingAddr],
      });
      const balance = await simulateTransaction({
        transaction: balanceOfTx,
      });

      return formatUnits(balance, config.contracts.decimals.fusdc);
    },
  });
}
