import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export function generateImageMetadata() {
  return [
    {
      contentType: "image/png",
      id: "default",
      size,
    },
  ];
}

export default async function Icon() {
  return new ImageResponse(
    <img
      src={"https://9lives.so/images/dppm-og-image.png"}
      alt="9lives.so"
      width={size.width}
      height={size.height}
    />,
  );
}
