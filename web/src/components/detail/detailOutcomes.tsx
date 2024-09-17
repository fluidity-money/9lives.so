import { CampaignListQuery } from "@/gql/graphql";
import Image from "next/image";
import CatImage from "#/images/cat.png";
import Button from "../themed/button";
import { SelectedBet } from "../campaign/campaignItem";
import { combineClass } from "@/utils/combineClass";

type Outcomes = CampaignListQuery["campaigns"][number]["outcomes"];
function DetailOutcomeItem({
  data,
  selectedBet,
  setSelectedBet,
}: {
  data: Outcomes[number];
  selectedBet?: SelectedBet;
  setSelectedBet: React.Dispatch<SelectedBet>;
}) {
  function handleSelect(data: Omit<SelectedBet, "bet">, bet: boolean) {
    setSelectedBet({ ...data, bet });
  }
  const borderStyle = "border-b border-b-gray-200";

  const isSelected = data.identifier === selectedBet?.identifier;

  return (
    <tr
      onClick={() => handleSelect(data, true)}
      key={data.identifier}
      className={combineClass(
        isSelected ? "rounded-xl bg-9blueLight" : "hover:bg-9blueLight/50",
        "cursor-pointer",
      )}
    >
      <td className={borderStyle}>
        <div className="flex items-center gap-2 px-4">
          <Image
            width={40}
            height={40}
            alt={data.name}
            src={CatImage}
            className="border border-9black"
          />
          <h2 className="text-sm font-normal tracking-wide">{data.name}</h2>
        </div>
      </td>
      <td className={borderStyle}>
        <span className="font-chicago text-xs font-normal">75%</span>
      </td>
      <td
        className={combineClass(
          borderStyle,
          "flex items-end justify-end gap-2 p-4",
        )}
      >
        <Button
          title="Bet Yes"
          intent={"yes"}
          size={"large"}
          className={combineClass(
            isSelected &&
              selectedBet.bet &&
              "bg-green-500 font-bold text-white hover:bg-green-500",
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(data, true);
          }}
        />
        <Button
          title="Bet No"
          intent={"no"}
          size={"large"}
          className={combineClass(
            isSelected &&
              !selectedBet.bet &&
              "bg-red-500 font-bold text-white hover:bg-red-500",
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(data, false);
          }}
        />
      </td>
    </tr>
  );
}

export default function DetailOutcomes({
  data,
  selectedBet,
  setSelectedBet,
}: {
  data: Outcomes;
  selectedBet?: SelectedBet;
  setSelectedBet: React.Dispatch<SelectedBet>;
}) {
  return (
    <table className="w-full">
      <thead className={"border-y border-y-gray-200"}>
        <tr>
          <th className="py-3 text-left font-chicago text-xs font-normal uppercase text-gray-400">
            Outcome
          </th>
          <th className="text-left font-chicago text-xs font-normal uppercase text-gray-400">
            Chance %
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data.map((outcome) => (
          <DetailOutcomeItem
            key={outcome.identifier}
            data={outcome}
            selectedBet={selectedBet}
            setSelectedBet={setSelectedBet}
          />
        ))}
      </tbody>
    </table>
  );
}
