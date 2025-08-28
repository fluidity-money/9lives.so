import useCountdown from "@/hooks/useCountdown";

export function CountdownTimer({ endTime }: { endTime: number }) {
  const timeleft = useCountdown(endTime);
  return (
    <span className="bg-9red px-0.5 py-[1px] text-9black">{timeleft}</span>
  );
}
