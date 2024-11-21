"use client";
import Image from "next/image";
import { useActiveWallet } from "thirdweb/react";
import PlusIcon from "#/icons/plus.svg";
import Link from "next/link";

export default function CreateCampaingButton() {
  const account = useActiveWallet();

  if (!account) return;

  return (
    <div className="h-10 border-r-2 border-r-black">
      <Link href={"/create-campaign"}>
        <button className="flex items-center justify-center px-4 font-chicago leading-10 underline">
          Create Campaign{" "}
          <Image src={PlusIcon} width={14} height={14} alt="Create Campaign" />
        </button>
      </Link>
    </div>
  );
}
