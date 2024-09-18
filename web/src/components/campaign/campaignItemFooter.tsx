interface CampaignItemFooterProps {}
export default function CampaignItemFooter({}: CampaignItemFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      <span>105 ETH Bet</span>
      <span>10K fUSDC Reward</span>
    </div>
  );
}
