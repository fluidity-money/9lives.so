import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "ethers";
import { prepareContractCall, simulateTransaction } from "thirdweb";

interface CampaignItemFooterProps {
  tradingAddr: `0x${string}`;
}
export default function CampaignItemFooter({
  tradingAddr,
}: CampaignItemFooterProps) {
  const { data, isLoading } = useQuery({
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

  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <span>{data} fUSDC Vol.</span>
      {/* <span>10K fUSDC Reward</span> */}
    </div>
  );
}
