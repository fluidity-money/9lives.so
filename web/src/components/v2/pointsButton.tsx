"use client";

import { combineClass } from "@/utils/combineClass";
import Button from "./button";

const POINTS_URL = "https://points.superposition.so";

export default function PointsButton({
  shouldHideOnMobile = false,
  inverted = false,
}: {
  shouldHideOnMobile?: boolean;
  inverted?: boolean;
}) {
  function handleClick() {
    window.open(POINTS_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      title="Points"
      intent={inverted ? "inverted" : "cta"}
      onClick={handleClick}
      className={combineClass(shouldHideOnMobile && "hidden md:block")}
    />
  );
}
