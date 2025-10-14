import Link from "next/link";

export default function AdvancedModeButton() {
  return (
    <Link
      className="relative hidden h-10 items-center gap-0 border-l-2 border-l-9black bg-9yellow px-4 focus:outline-none sm:flex"
      href={"/"}
    >
      <span className="font-chicago text-xs underline">Advanced Mode 🚀</span>
    </Link>
  );
}
