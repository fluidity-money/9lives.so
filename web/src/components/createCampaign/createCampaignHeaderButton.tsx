"use client";
import Image from "next/image";
import PlusIcon from "#/icons/plus.svg";
import Link from "next/link";

export default function CreateCampaingButton() {
  return (
    <div className="h-10">
      <Link href={"/create-campaign"}>
        <button className="hidden items-center justify-center px-4 font-chicago leading-10 underline md:flex">
          <span className="hidden lg:inline">Create Campaign</span>
          <span className="lg:hidden">Create</span>{" "}
          <Image src={PlusIcon} width={14} height={14} alt="Create Campaign" />
        </button>
      </Link>
    </div>
  );
}
