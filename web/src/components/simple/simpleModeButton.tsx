import Link from "next/link";

export default function SimpleModeButton() {
  return (
    <Link
      className="flex h-10 items-center justify-center gap-1 border-9black px-4 md:border-l-2"
      href={"/simple/campaign/btc"}
    >
      <span className="font-chicago text-xs underline md:hidden lg:inline">
        Simple Mode
      </span>{" "}
      <span className="w-5 md:w-4">🐣</span>
    </Link>
  );
}
