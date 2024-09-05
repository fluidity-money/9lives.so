import { CampaignListQuery } from "@/gql/graphql";

interface CampaignItemOutcomesProps {
  outcomes: CampaignListQuery["campaigns"][number]["outcomes"];
}
export default function CampaignItemOutcomes({
  outcomes,
}: CampaignItemOutcomesProps) {
  if (outcomes.length === 2) return <div></div>;

  return (
    <ul>
      {outcomes.map((outcome) => (
        <li
          key={outcome.identifier}
          className="flex items-center justify-between text-xs"
        >
          <span className="">{outcome.name}</span>
          <div>
            <span>{"%75"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
