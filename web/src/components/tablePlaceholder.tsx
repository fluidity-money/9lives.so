import Placeholder from "./placeholder";
export default function TablePlaceholder({
  title,
  subtitle,
  colSpan = 5,
  height = "min-h-36",
}: {
  title: string;
  subtitle?: string;
  colSpan?: number;
  height?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Placeholder title={title} subtitle={subtitle} height={height} />
      </td>
    </tr>
  );
}
