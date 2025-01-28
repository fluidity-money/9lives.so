import formatFusdc from "@/utils/formatFusdc";

interface CampaignItemFooterProps {
  volume: number;
}
export default function CampaignItemFooter({
  volume,
}: CampaignItemFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <span>{formatFusdc(volume + 2e6)} USDC Vol.</span>
    </div>
  );
}
