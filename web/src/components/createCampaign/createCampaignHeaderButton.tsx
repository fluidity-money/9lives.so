"use client";
import Image from "next/image";
import PlusIcon from "#/icons/plus.svg";
import Link from "next/link";

export default function CreateCampaingButton() {
  return (
    <div className="h-10">
      <Link href={"#"} disabled>
        <button
          className="hidden items-center justify-center px-4 font-chicago leading-10 underline md:flex"
          disabled
        >
          Create Campaign{" "}
          <Image src={PlusIcon} width={14} height={14} alt="Create Campaign" />
        </button>
      </Link>
    </div>
  );
}
