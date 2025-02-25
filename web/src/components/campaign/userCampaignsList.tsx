import { useState } from "react";
import CampaignList from "./campaignList";
import { CampaignFilters } from "@/types";
import { useActiveAccount } from "thirdweb/react";

export default function UserCampaignsList() {
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("volume");
  const account = useActiveAccount();
  return (
    <CampaignList
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      address={account?.address ?? "0x"}
    />
  );
}
