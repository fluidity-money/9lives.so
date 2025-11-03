import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import RightCaretIcon from "#/icons/right-caret.svg";
import RetroCard from "./cardRetro";

export default function PointMenuButton() {
  return (
    <Menu>
      <MenuButton className="group flex items-center">
        <span className="font-chicago text-neutral-800 transition-colors group-hover:underline dark:text-9gray">
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
          <RetroCard title="Coming Soon" position="middle" showClose={false}>
            <p className="font-chicago">🥳 9lives points are coming soon! 🎉</p>
          </RetroCard>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
