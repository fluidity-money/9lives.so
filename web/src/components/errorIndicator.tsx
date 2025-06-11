import Image from "next/image";
import ErrorImage from "#/icons/sad-face.svg";
export default function ErrorIndicator({ msg }: { msg?: string }) {
  return (
    <div className="flex items-center justify-center">
      <Image src={ErrorImage} alt="" width={20} />
      <span className="ml-2 font-geneva text-sm">
        {msg ?? "Ups something went wrong."}
      </span>
    </div>
  );
}
