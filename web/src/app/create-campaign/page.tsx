import CreateCampaignForm from "@/components/createCampaign/createCampaignForm";
import CreateCampaignPreview from "@/components/createCampaign/createCampaignPreview";
import CreateCampaignTutorial from "@/components/createCampaign/createCampaignTutorial";

export default function CreateCampaign() {
  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-chicago text-2xl">Create Campaign</h2>
        </div>
        <p className="text-center text-xs">
          Create a campaign for other people to participate in!
          <br />
          <strong>Earn fees by creating markets:</strong> collect 1% of all buy
          volume as the creator, and 1% as a LP. 1% goes to the DAO.
        </p>
      </div>
      <div className="flex flex-1 gap-7">
        <CreateCampaignForm />
        <div className="flex flex-1 flex-col gap-7">
          <CreateCampaignTutorial />
          <div className="sticky top-0">
            <CreateCampaignPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
