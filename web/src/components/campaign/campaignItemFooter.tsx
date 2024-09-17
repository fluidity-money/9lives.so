interface CampaignItemFooterProps {}
export default function CampaignItemFooter({}: CampaignItemFooterProps) {
  return (
    <div className="text-md flex items-center justify-between gap-2 font-geneva uppercase tracking-wide text-[#808080]">
      <span>105 ETH Bet</span>
      <span>10K fUSDC Reward</span>
    </div>
  );
}
