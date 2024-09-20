import { combineClass } from "@/utils/combineClass";
import DetailOutcomeItem from "@/components/detail/detailOutcomeItem";
import { Outcome } from "@/types";

export default function DetailOutcomes({ data }: { data: Outcome[] }) {
  const borderStyle = "border-y border-y-gray-200";

  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th
            className={combineClass(
              borderStyle,
              "py-3 text-left font-chicago text-xs font-normal uppercase text-gray-400",
            )}
          >
            Outcome
          </th>
          <th
            className={combineClass(
              borderStyle,
              "text-left font-chicago text-xs font-normal uppercase text-gray-400",
            )}
          >
            Chance %
          </th>
          <th className={borderStyle}></th>
        </tr>
      </thead>
      <tbody>
        {data.map((outcome, idx) => (
          <DetailOutcomeItem
            key={outcome.identifier}
            data={outcome}
            index={idx}
          />
        ))}
      </tbody>
    </table>
  );
}
