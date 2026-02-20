import { Trade } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function LiveTrades({ campaignId }: { campaignId: string }) {
  const { data } = useQuery<Trade[]>({
    queryKey: ["campaignTrades", campaignId],
    initialData: [],
    queryFn: async () => {
      throw new Error(
        "This function should be called. This query is being updated by websocket.",
      );
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: false,
  });
  if (!(data && data.length > 0)) return null;
  return (
    <ul className="bg-2white/50">
      {data
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((i) => (
          <li key={i.txHash} className="text-xs font-bold text-green-700">
            +${i.amount}
          </li>
        ))}
    </ul>
  );
}
