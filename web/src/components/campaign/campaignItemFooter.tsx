import formatFusdc from "@/utils/formatFusdc";

interface CampaignItemFooterProps {
  volume: number;
}
export default function CampaignItemFooter({
  volume,
}: CampaignItemFooterProps) {
  if (volume === 0) return null;
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <span>{formatFusdc(volume)} USDC Vol.</span>
    </div>
  );
}
