import useDetails from "./useDetails";

export default function useChances({
  tradingAddr,
  outcomeIds,
}: {
  tradingAddr: `0x${string}`;
  outcomeIds: `0x${string}`[];
}) {
  const { data } = useDetails({
    tradingAddr,
    outcomeIds,
  });
  if (!data)
    return outcomeIds.map((id) => ({
      id,
      chance: 0,
      investedAmount: BigInt(0),
    }));
  const chances = outcomeIds.map((id) => {
    const investedAmount = data.outcomes.find((o) => o.id === id)!.invested;
    return {
      id,
      chance: (Number(investedAmount) / Number(data.totalInvestment)) * 100,
      investedAmount,
    };
  });
  return chances;
}
