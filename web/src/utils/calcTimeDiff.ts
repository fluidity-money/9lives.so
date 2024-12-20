// endTime is a millisecond timestamp
export default function calcTimeDiff(endTime: number) {
  const differenceInMs = new Date(endTime).getTime() - Date.now();
  if (0 >= differenceInMs) {
    return {
      full: "End date is already due.",
      short: "End date is already due.",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);
  return {
    full: `${days}D:${hours}H:${minutes}M:${seconds}S`,
    short: `${days}D:${hours}H:${minutes}M`,
    days,
    hours,
    minutes,
    seconds,
  };
}
