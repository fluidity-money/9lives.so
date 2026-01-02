import CreateCampaignForm from "@/components/createCampaign/createCampaignForm";
import CreateCampaignPreview from "@/components/createCampaign/createCampaignPreview";
import CreateCampaignTutorial from "@/components/createCampaign/createCampaignTutorial";
import appConfig from "@/config";
import { redirect } from "next/navigation";

export default async function CreateCampaign() {
  // Remove this when feature works again: begin
  const featuresRes = await fetch(appConfig.NEXT_PUBLIC_FEATURES_URL);
  const features = (await featuresRes.json()) as {
    "enable campaign create": boolean;
  };
  if (!features["enable campaign create"]) redirect("/");
  // Remove this when feature works again: end

  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-chicago text-2xl">Create Campaign</h2>
        </div>
        <p className="text-center text-sm">
          Create a campaign for other people to participate in! Note that
          nonsensical markets may be delisted.
          <br />
          <br />
          <span className="bg-9green px-1 py-0.5 font-bold">
            Earn fees and points by creating markets
          </span>
          <br />
          Collect 1% of all buy volume as the creator, 1% as a LP and earn 2
          9lives points. 1% goes to the DAO.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-7 md:flex-row">
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
