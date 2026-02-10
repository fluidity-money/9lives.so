import useUnclaimedCampaigns from "@/hooks/useUnclaimedCampaigns";
import Button from "../themed/button";
import Modal from "../themed/modal";
import { useState } from "react";
import SimpleRewardsDialog from "./simpleRewardsDialog";
import { useAppKitAccount } from "@reown/appkit/react";
import { combineClass } from "@/utils/combineClass";

export default function SimpleClaimAllButton({
  token,
  variant = "fixed",
}: {
  token?: string;
  variant?: "inline" | "fixed";
}) {
  const account = useAppKitAccount();
  const { data } = useUnclaimedCampaigns(account?.address, token);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (data && data.length > 0) {
    return (
      <>
        <Button
          size={variant === "fixed" ? "xlarge" : "medium"}
          intent={"reward"}
          className={combineClass(
            variant === "fixed" ? "bottom-4 right-4 md:fixed" : "flex-auto",
          )}
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
