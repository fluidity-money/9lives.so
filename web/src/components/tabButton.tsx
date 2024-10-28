import Image from "next/image";
import Leftborder from "#/images/left-border.svg";
import Rightborder from "#/images/right-border.svg";

export default function TabButton({ title }: { title: string }) {
  return (
    <div className="mb-[-2px] flex">
      <Image
        src={Leftborder}
        width={13}
        height={13}
        alt={title + "left-border"}
      />
      <span className="border-t border-t-black bg-9layer px-2 py-1 font-chicago text-xs">
        {title}
      </span>
      <Image
        src={Rightborder}
        width={13}
        height={13}
        alt={title + "right-border"}
      />
    </div>
  );
}
