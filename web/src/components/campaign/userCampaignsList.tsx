import { useState } from "react";
import { CampaignFilters } from "@/types";
import CampaignTable from "./campaignTable";
import { useAppKitAccount } from "@reown/appkit/react";

export default function UserCampaignsList() {
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("newest");
  const account = useAppKitAccount();
  return (
    <CampaignTable
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      address={account.address}
      userList
    />
  );
}
