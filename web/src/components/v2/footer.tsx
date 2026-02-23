"use client";
import { useModalStore } from "@/stores/modalStore";
import Link from "next/link";
import GroupButton from "./groupButton";
import { usePathname, useRouter } from "next/navigation";
const gitHash = process.env.NEXT_PUBLIC_GIT_HASH;
const socials = [
  {
    title: "X",
    page: "https://x.com/superpositionso",
  },
  {
    title: "Discord",
    page: "https://discord.gg/VjUWjRQP8y",
  },
  {
    title: `Commit ${gitHash}`,
    page: `https://github.com/fluidity-money/9lives.so/commit/${gitHash}`,
  },
];
const menu = [
  {
    title: "Terms & Conditions",
    page: "#",
  },
  {
    title: "Privacy Policy",
    page: "https://static.9lives.so/privacy.pdf",
  },
  {
    title: "Issues board",
    page: "https://issues.superposition.so",
  },
  {
    title: "Status",
    page: "https://status.9lives.so/",
  },
  {
    title: "Docs",
    page: "https://docs.9lives.so",
  },
  {
    title: "Grafana",
    page: "https://grafana.9lives.so",
  },
];

const MenuItem = ({ item }: { item: { page: string; title: string } }) => (
  <Link
    href={item.page}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm font-medium text-2black hover:underline"
  >
    {item.title}
  </Link>
);
export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <footer className="hidden flex-col items-center justify-between gap-4 self-stretch border-t border-t-neutral-300 p-4 md:mb-0 md:flex md:flex-row md:py-2">
      <div className="flex flex-col items-center gap-2 md:flex-row">
        <GroupButton
          buttons={[
            { title: "v1", callback: () => router.push("/v1") },
            { title: "v2", callback: () => router.push("/") },
          ]}
          initialIdx={pathname.startsWith("/v1") ? 0 : 1}
          variant="small"
        />
        <nav className="flex flex-col items-center justify-start gap-4 text-xs md:flex-row">
          {menu.map((item) => (
            <MenuItem item={item} key={item.title} />
          ))}
        </nav>
      </div>
    </footer>
  );
}
