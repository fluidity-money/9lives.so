import useInvestedAmount from "@/hooks/useInvestedAmount";
interface CampaignItemFooterProps {
  tradingAddr: `0x${string}`;
}
export default function CampaignItemFooter({
  tradingAddr,
}: CampaignItemFooterProps) {
  const { data } = useInvestedAmount({ tradingAddr });
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <span>{data} fUSDC Vol.</span>
      {/* <span>10K fUSDC Reward</span> */}
    </div>
  );
}
