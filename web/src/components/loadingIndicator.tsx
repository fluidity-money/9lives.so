import Image from "next/image";
import LoadingImage from "#/icons/loading.svg";
export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={LoadingImage}
        className="animate-spin"
        alt="Loading"
        width={16}
      />
      <span className="ml-2 font-geneva text-sm">Loading...</span>
    </div>
  );
}
