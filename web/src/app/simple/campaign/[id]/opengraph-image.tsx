import detailImageGenerator from "@/components/detailImageGenerator";
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
type Params = Promise<{ id: string }>;
export default async function ImageOG({ params }: { params: Params }) {
  const { id } = await params;
  return new ImageResponse(
    (
      <img
        src={`https://9lives.so/dppm-og-image.png`}
        alt="9lives.so"
        width={size.width}
        height={size.height}
      />
    ),
  );
}
