import Placeholder from "./placeholder";
export default function TablePlaceholder({
  title,
  subtitle,
  colSpan = 5,
  height = "min-h-36",
  modern = false,
}: {
  title: string;
  subtitle?: string;
  colSpan?: number;
  height?: string;
  modern?: boolean;
}) {
  return (
    <tr className={modern ? "text-2black" : undefined}>
      <td
        colSpan={colSpan}
        className={modern ? "rounded-xl bg-neutral-100" : undefined}
      >
        <Placeholder
          title={title}
          subtitle={subtitle}
          height={height}
          modern={modern}
        />
      </td>
    </tr>
  );
}
