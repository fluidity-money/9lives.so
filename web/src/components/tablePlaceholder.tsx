export default function Placeholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex min-h-36 flex-col items-center justify-center gap-1">
          <span className="font-chicago text-xs">{title}</span>
          <span className="font-geneva text-[10px] uppercase text-[#808080]">
            {subtitle}
          </span>
        </div>
      </td>
    </tr>
  );
}
