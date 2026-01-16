"use client";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import makeBlockie from "ethereum-blockies-base64";
import Image from "next/image";
import LoginIcon from "#/icons/login.svg";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import { combineClass } from "@/utils/combineClass";

export default function ConnectButton() {
  const account = useAppKitAccount();
  const enableCreate = useFeatureFlag("enable campaign create");
  const { open } = useAppKit();
  return (
    <div
      onClick={() => open()}
      className={combineClass(
        enableCreate ? "border-l-2" : "border-0",
        "flex h-10 cursor-pointer items-center border-l-black px-2",
      )}
    >
      {account.isConnected && account.address ? (
        <div className="flex items-center gap-1">
          <Image
            alt={""}
            width={24}
            height={24}
            className="size-6 shrink-0 border border-9black bg-9gray"
            src={makeBlockie(account.address)}
          />
          <div>
            <span className="font-chicago text-xs font-bold">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="font-chicago text-xs underline">Connect Wallet</span>{" "}
          <Image src={LoginIcon} height={14} width={14} alt="Connect Wallet" />
        </div>
      )}
    </div>
  );
}
