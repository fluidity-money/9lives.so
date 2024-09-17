import Link from "next/link";
export default function FooterMenu() {
  const menu = [
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
      page: "#",
    },
    {
      title: "Terms & Conditions",
      page: "#",
    },
    {
      title: "Privacy Policy",
      page: "#",
    },
  ];

  return (
    <nav className="flex max-w-72 flex-wrap items-center justify-end gap-4 text-xs">
      {menu.map((item) => (
        <Link
          key={item.page}
          href={item.page}
          className="font-chicago text-neutral-800 hover:underline"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
