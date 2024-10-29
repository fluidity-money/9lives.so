import Link from "next/link";
const socials = [
  {
    title: "Twitter",
    page: "#",
  },
  {
    title: "Telegram",
    page: "#",
  },
  {
    title: "Discord",
    page: "https://discord.gg/VjUWjRQP8y",
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
    title: "Docs",
    page: "https://docs.9lives.so",
  },
];
const MenuItem = ({ item }: { item: { page: string; title: string } }) => (
  <Link
    href={item.page}
    className="font-chicago text-neutral-800 hover:underline"
  >
    {item.title}
  </Link>
);
export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t-2 border-t-black bg-9blueLight px-4 py-8">
      <nav className="flex items-center justify-start gap-4 text-xs">
        {menu.map((item) => (
          <MenuItem item={item} key={item.title} />
        ))}
      </nav>
      <nav className="flex items-center justify-end gap-4 text-xs">
        {socials.map((item) => (
          <MenuItem item={item} key={item.title} />
        ))}
      </nav>
    </footer>
  );
}
