"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import RightCaretIcon from "#/icons/right-caret.svg";
import RetroCard from "./cardRetro";
import use9LivesPoints from "@/hooks/use9LivesPoints";
import Button from "./themed/button";
import Link from "next/link";
import LoadingImage from "#/icons/loading.svg";
import { combineClass } from "@/utils/combineClass";
import { useActiveAccount } from "thirdweb/react";

export default function PointMenuButton() {
  const account = useActiveAccount();
  const { data, isLoading } = use9LivesPoints({
    address: account?.address,
    enabled: !!account,
  });
  return (
    <Menu>
      <MenuButton className="group flex items-center">
        <span className="font-chicago text-neutral-800 group-hover:underline">
          Points
        </span>
        <Image
          alt=""
          src={RightCaretIcon}
          width={20}
          className="transition-transform group-data-[active]:rotate-90"
        />
      </MenuButton>
      <MenuItems anchor="bottom" className="z-[99]">
        <MenuItem>
          <RetroCard
            title="9lives Points"
            className="flex flex-col gap-4"
            position="middle"
            showClose={false}
          >
            <p className="text-center font-geneva uppercase">
              My Accumulated Points
            </p>
            <span
              className={combineClass(
                isLoading ? "bg-[#ccc]" : "bg-9green",
                "mx-auto p-2 font-chicago text-2xl",
              )}
            >
              {isLoading ? (
                <Image
                  src={LoadingImage}
                  className="animate-spin"
                  alt="Loading"
                  width={24}
                />
              ) : (
                (data?.[0]?.amount ?? 0)
              )}
            </span>
            <Link
              target="_blank"
              href="https://medium.com/@Superpositionso"
              className="mx-auto font-geneva text-xs underline"
            >
              Learn More
            </Link>
            <div className="flex flex-col gap-1">
              <Link href="/leaderboard">
                <Button
                  title="Leaderboard"
                  size={"large"}
                  intent={"cta"}
                  className={"w-full"}
                />
              </Link>
              {/* <Button title="Coming Soon" disabled className={"w-full"} /> */}
            </div>
          </RetroCard>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
