import useUnclaimedCampaigns from "@/hooks/useUnclaimedCampaigns";
import Button from "../themed/button";
import Modal from "../themed/modal";
import { useState } from "react";
import SimpleRewardsDialog from "./simpleRewardsDialog";
import { useAppKitAccount } from "@reown/appkit/react";

export default function SimpleClaimAllButton({ token }: { token?: string }) {
  const account = useAppKitAccount();
  const { data } = useUnclaimedCampaigns(account?.address, token);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (data && data.length > 0) {
    return (
      <>
        <Button
          size={"xlarge"}
          intent={"reward"}
          className={"bottom-4 right-4 flex-1 md:fixed"}
          onClick={() => setIsModalOpen(true)}
          title={`🔔 ${data.length} Rewards Unclaimed`}
        />
        <Modal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          title="Claim Your Rewards"
        >
          <SimpleRewardsDialog
            data={data}
            token={token}
            closeModal={() => setIsModalOpen(false)}
          />
        </Modal>
      </>
    );
  }

  return null;
}
