import { useEffect, useState } from "react";

export default function TimingGate({
  ending,
  starting,
  children,
}: {
  ending: number;
  starting: number;
  children: (state: {
    isEnded: boolean;
    notStarted: boolean;
  }) => React.ReactNode;
}) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());

    const timeoutId = setTimeout(tick, 0);

    const intervalId = setInterval(tick, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return children({
    isEnded: ending < now,
    notStarted: starting > now,
  });
}
