"use client";
import useUnclaimedCampaigns from "@/hooks/useUnclaimedCampaigns";
import Button from "./button";
import Modal from "./modal";
import { useState } from "react";
import SimpleRewardsDialog from "./rewardsDialog";
import { useAppKitAccount } from "@reown/appkit/react";
import { combineClass } from "@/utils/combineClass";
import { useWSForRewards } from "@/hooks/useWSForRewards";

export function ClaimButton({
  title,
  onClick,
  shouldHideOnMobile = false,
}: {
  title: string;
  onClick: () => void;
  shouldHideOnMobile?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      intent="reward"
      className={combineClass(shouldHideOnMobile && "hidden md:block")}
      icon={
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.125 3.5C14.1 3.4375 14.0738 3.375 14.0469 3.3125C13.6436 2.38252 12.991 1.58218 12.1613 1H13.5C13.6326 1 13.7598 0.947321 13.8536 0.853553C13.9473 0.759785 14 0.632608 14 0.5C14 0.367392 13.9473 0.240215 13.8536 0.146446C13.7598 0.0526783 13.6326 0 13.5 0H7C5.61756 0.00175536 4.28634 0.523347 3.27068 1.4612C2.25501 2.39906 1.6292 3.68458 1.5175 5.0625C1.0856 5.16986 0.70185 5.41821 0.426993 5.76824C0.152135 6.11826 0.00187595 6.54996 0 6.995C0 7.12761 0.0526784 7.25479 0.146447 7.34855C0.240215 7.44232 0.367392 7.495 0.5 7.495C0.632608 7.495 0.759785 7.44232 0.853553 7.34855C0.947322 7.25479 1 7.12761 1 6.995C1.00012 6.81267 1.05008 6.63384 1.14449 6.47786C1.23889 6.32187 1.37415 6.19467 1.53562 6.11C1.66008 7.23179 2.12784 8.28779 2.875 9.13375L3.66 11.3313C3.7294 11.5256 3.85724 11.6938 4.02598 11.8126C4.19473 11.9314 4.39611 11.9951 4.6025 11.995H5.3975C5.60378 11.995 5.80503 11.9312 5.97365 11.8124C6.14227 11.6936 6.27001 11.5255 6.33938 11.3313L6.45937 10.995H10.0406L10.1606 11.3313C10.23 11.5255 10.3577 11.6936 10.5264 11.8124C10.695 11.9312 10.8962 11.995 11.1025 11.995H11.8975C12.1038 11.995 12.305 11.9312 12.4736 11.8124C12.6423 11.6936 12.77 11.5255 12.8394 11.3313L13.8525 8.495H14C14.3978 8.495 14.7794 8.33696 15.0607 8.05566C15.342 7.77436 15.5 7.39282 15.5 6.995V4.995C15.5001 4.61878 15.3587 4.25627 15.104 3.97936C14.8494 3.70245 14.4999 3.53135 14.125 3.5ZM9.5 2.495H7C6.86739 2.495 6.74021 2.44232 6.64645 2.34855C6.55268 2.25478 6.5 2.12761 6.5 1.995C6.5 1.86239 6.55268 1.73521 6.64645 1.64145C6.74021 1.54768 6.86739 1.495 7 1.495H9.5C9.63261 1.495 9.75979 1.54768 9.85355 1.64145C9.94732 1.73521 10 1.86239 10 1.995C10 2.12761 9.94732 2.25478 9.85355 2.34855C9.75979 2.44232 9.63261 2.495 9.5 2.495ZM11.25 5.995C11.1017 5.995 10.9567 5.95101 10.8333 5.8686C10.71 5.78619 10.6139 5.66906 10.5571 5.53201C10.5003 5.39497 10.4855 5.24417 10.5144 5.09868C10.5433 4.9532 10.6148 4.81956 10.7197 4.71467C10.8246 4.60978 10.9582 4.53835 11.1037 4.50941C11.2492 4.48047 11.4 4.49532 11.537 4.55209C11.6741 4.60886 11.7912 4.70499 11.8736 4.82832C11.956 4.95166 12 5.09666 12 5.245C12 5.44391 11.921 5.63468 11.7803 5.77533C11.6397 5.91598 11.4489 5.995 11.25 5.995Z"
            fill="currentColor"
          />
        </svg>
      }
      title={title}
    />
  );
}

export default function SimpleClaimAllButton({
  token,
  shouldHideOnMobile = false,
}: {
  token?: string;
  shouldHideOnMobile?: boolean;
}) {
  const account = useAppKitAccount();
  const { data } = useUnclaimedCampaigns(account?.address, token);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useWSForRewards();
  if (data && data.length > 0) {
    return (
      <>
        <ClaimButton
          onClick={() => setIsModalOpen(true)}
          title={`${data.length} Rewards Unclaimed`}
          shouldHideOnMobile={shouldHideOnMobile}
        />
        <Modal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          boxContainerClass="max-w-[600px]"
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
