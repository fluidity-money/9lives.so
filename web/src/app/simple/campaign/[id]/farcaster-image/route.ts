import React from "react";
import { ImageResponse } from "next/og";

const size = {
  width: 1200,
  height: 800,
};
type Params = Promise<{ id: string }>;
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  return new ImageResponse(
    React.createElement("img", {
      src: "https://9lives.so/images/dppm-og-image.png",
      alt: "9lives.so",
      width: size.width,
      height: size.height,
    }),
    {
      width: size.width,
      height: size.height,
    },
  );
}
