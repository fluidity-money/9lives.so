import RetroCard from "@/components/cardRetro";

export default function CreateCampaignPreview() {
  return (
    <RetroCard
      title="YOUR CAMPAIGN SUMMARY"
      position="middle"
      showClose={false}
    >
      <p className="text-center font-geneva text-xs">
        You can see your campaign preview here
      </p>
    </RetroCard>
  );
}
