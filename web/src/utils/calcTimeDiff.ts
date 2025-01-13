// endTime is a millisecond timestamp
export function calcTimeLeft(endTime: number) {
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
export function calcTimePassed(endTime: number) {
  const differenceInMs =
    Date.now() -
    new Date(endTime).getTime() +
    new Date().getTimezoneOffset() * 60 * 1000;
  let text = "";
  let unit = 1000;
  switch (true) {
    case 1000 * 60 > differenceInMs:
      text = `${Math.round(differenceInMs / 1000)} Sec Ago`;
      unit = 1000;
      break;
    case 1000 * 60 * 60 > differenceInMs:
      text = `${Math.round(differenceInMs / (1000 * 60))} Min Ago`;
      unit = 1000 * 60;
      break;
    case 1000 * 60 * 60 * 24 > differenceInMs:
      text = `${Math.round(differenceInMs / (1000 * 60 * 60))} Hrs Ago`;
      unit = 1000 * 60 * 60;
      break;
    case 1000 * 60 * 60 * 24 * 30 > differenceInMs:
      text = `${Math.round(differenceInMs / (1000 * 60 * 60 * 24))} Days Ago`;
      unit = 1000 * 60 * 60 * 24;
      break;
    case 1000 * 60 * 60 * 24 * 365 > differenceInMs:
      text = `${Math.round(differenceInMs / (1000 * 60 * 60 * 24 * 30))} Months Ago`;
      unit = 1000 * 60 * 60 * 24 * 30;
      break;
    default:
      text = new Date(endTime).toDateString();
  }
  return { text, unit };
}
