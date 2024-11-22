import RetroCard from "@/components/cardRetro";
import CreateCampaignForm from "@/components/createCampaign/form";
import CreateCampaignTutorial from "@/components/createCampaign/tutorial";

export default function CreateCampaign() {
  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="z-2 font-chicago text-2xl">Create Campaign</h2>
          <span className="bg-9yellow px-2 py-1 font-geneva text-sm">
            Coming Soon
          </span>
        </div>
        <p className="text-center text-xs">
          This is where you can create your own campaign for other people to
          participate in!
        </p>
      </div>
      <div className="flex gap-7">
        <CreateCampaignForm />
        <div className="flex flex-1 flex-col gap-7">
          <CreateCampaignTutorial />
          <RetroCard
            title="YOUR CAMPAIGN SUMMARY"
            position="middle"
            showClose={false}
          >
            <p className="text-center font-geneva text-xs">
              You can see your campaign preview here
            </p>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}
