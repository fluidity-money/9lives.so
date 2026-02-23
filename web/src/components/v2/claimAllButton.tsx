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
          width="19"
          height="20"
          viewBox="0 0 19 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.692 7.23145H13.1615C13.3805 6.91999 13.5023 6.55303 13.512 6.17518C13.5207 5.88734 13.4692 5.60079 13.3605 5.33313C13.2519 5.06548 13.0884 4.82237 12.8801 4.61875C12.6719 4.41512 12.4232 4.25528 12.1495 4.14903C11.8758 4.04279 11.5827 3.99239 11.2883 4.00093C11.0164 4.0066 10.7486 4.06718 10.5018 4.17887C10.255 4.29055 10.0345 4.45092 9.85405 4.64992C9.72099 4.79833 9.60247 4.95864 9.50006 5.12873C9.39765 4.95864 9.27913 4.79833 9.14606 4.64992C8.96565 4.45092 8.74512 4.29055 8.4983 4.17887C8.25148 4.06718 7.98371 4.0066 7.7118 4.00093C7.41741 3.99239 7.12435 4.04279 6.85061 4.14903C6.57687 4.25528 6.32824 4.41512 6.11999 4.61875C5.91173 4.82237 5.74826 5.06548 5.6396 5.33313C5.53094 5.60079 5.4794 5.88734 5.48813 6.17518C5.49784 6.55303 5.61959 6.91999 5.83858 7.23145H4.30815C3.9952 7.23145 3.69507 7.353 3.47378 7.56938C3.25249 7.78575 3.12817 8.07921 3.12817 8.38521V10.2312C3.12812 10.4972 3.22205 10.755 3.39407 10.9611C3.56609 11.1671 3.80563 11.3087 4.07216 11.3619V14.8462C4.07216 15.1522 4.19648 15.4457 4.41776 15.6621C4.63905 15.8784 4.93919 16 5.25214 16H13.748C14.0609 16 14.3611 15.8784 14.5824 15.6621C14.8036 15.4457 14.928 15.1522 14.928 14.8462V11.3619C15.1945 11.3087 15.434 11.1671 15.606 10.9611C15.7781 10.755 15.872 10.4972 15.8719 10.2312V8.38521C15.8719 8.07921 15.7476 7.78575 15.5263 7.56938C15.305 7.353 15.0049 7.23145 14.692 7.23145ZM14.456 10.0005H10.208V8.61596H14.456V10.0005ZM10.916 5.56831C10.9683 5.51163 11.0319 5.46613 11.103 5.43466C11.174 5.40319 11.251 5.38643 11.329 5.38544H11.3497C11.4495 5.38516 11.5484 5.40452 11.6404 5.44237C11.7325 5.48021 11.8158 5.53577 11.8854 5.60574C11.955 5.6757 12.0096 5.75865 12.0457 5.84964C12.0819 5.94063 12.099 6.0378 12.096 6.13538C12.095 6.21166 12.0779 6.28691 12.0457 6.3564C12.0135 6.4259 11.9669 6.48813 11.909 6.53919C11.5019 6.89224 10.8323 7.07338 10.2788 7.15992C10.3673 6.62111 10.5526 5.96635 10.916 5.56831ZM7.1224 5.59888C7.26245 5.46342 7.45109 5.38682 7.64808 5.38544H7.67109C7.74911 5.38643 7.82607 5.40319 7.89714 5.43466C7.96821 5.46613 8.03186 5.51163 8.08408 5.56831C8.44516 5.96635 8.63041 6.62053 8.71832 7.16107C8.16963 7.07396 7.49409 6.89282 7.09113 6.53919C7.03317 6.48813 6.98663 6.4259 6.95444 6.3564C6.92226 6.28691 6.90512 6.21166 6.90411 6.13538C6.9015 6.03617 6.9195 5.93747 6.95702 5.84525C6.99454 5.75304 7.0508 5.66923 7.1224 5.59888ZM4.54415 8.61596H8.79207V10.0005H4.54415V8.61596ZM5.48813 11.385H8.79207V14.6155H5.48813V11.385ZM10.208 14.6155V11.385H13.512V14.6155H10.208Z"
            fill="black"
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
