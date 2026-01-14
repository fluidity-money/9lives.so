import Image from "next/image";
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export default async function ImageOG() {
  return new ImageResponse(
    <Image
      src={"https://9lives.so/images/dppm-og-image.png"}
      alt="9lives.so"
      width={size.width}
      height={size.height}
    />,
  );
}
