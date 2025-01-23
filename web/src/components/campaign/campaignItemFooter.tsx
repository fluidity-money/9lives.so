import config from "@/config";
import { formatUnits } from "ethers";

interface CampaignItemFooterProps {
  volume: number;
}
export default function CampaignItemFooter({
  volume,
}: CampaignItemFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <span>
        {Number(formatUnits(volume, config.contracts.decimals.fusdc)).toFixed(
          0,
        )}{" "}
        fUSDC Vol.
      </span>
    </div>
  );
}
