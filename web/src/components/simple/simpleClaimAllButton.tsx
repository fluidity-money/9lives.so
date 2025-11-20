import useUnclaimedCampaigns from "@/hooks/useUnclaimedCampaigns";
import { useActiveAccount } from "thirdweb/react";
import Button from "../themed/button";
import Modal from "../themed/modal";
import { useState } from "react";
import SimpleRewardsDialog from "./simpleRewardsDialog";

export default function SimpleClaimAllButton({ token }: { token?: string }) {
  const account = useActiveAccount();
  const { data } = useUnclaimedCampaigns(account?.address, token);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (data && data.length > 0) {
    return (
      <>
        <Button
          size={"large"}
          intent={"cta"}
          onClick={() => setIsModalOpen(true)}
          title={`🔔 ${data.length} Rewards Unclaimed`}
        />
        <Modal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          title="Claim Your Rewards"
        >
          <SimpleRewardsDialog data={data} />
        </Modal>
      </>
    );
  }

  return null;
}
