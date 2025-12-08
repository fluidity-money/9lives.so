import { useState } from "react";
import { CampaignFilters } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import CampaignTable from "./campaignTable";

export default function UserCampaignsList() {
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("newest");
  const account = useActiveAccount();
  return (
    <CampaignTable
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      account={account}
      userList
    />
  );
}
