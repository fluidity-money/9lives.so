import useCountdown from "@/hooks/useCountdown";
import { HeaderBox } from "./headerBox";

export default function CountdownTimer({ endTime }: { endTime: number }) {
  const timeleft = useCountdown(endTime);

  return (
    <div suppressHydrationWarning>
      <HeaderBox
        shrink
        title="Time"
        value={timeleft.toString()}
        valueColor="text-orange-500"
      />
    </div>
  );
}
