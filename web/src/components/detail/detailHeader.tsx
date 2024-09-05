import Image from "next/image";
import CatImage from "#/images/cat.png";
import Button from "@/components/themed/button";
export default function DetailHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          alt="tldr"
          width={80}
          height={80}
          className="rounded-md"
          src={CatImage}
        />
        <h1>USA Election Winner 2024</h1>
      </div>
      <Button>Watchlist</Button>
    </div>
  );
}
