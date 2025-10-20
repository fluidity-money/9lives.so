// endTime in calcTimeLeft is a second timestamp
export function calcTimeLeft(endTime: number) {
  let endTimeInMs: number = 0;
  if (endTime.toString().length === 16) {
    // if endTime in microseconds
    endTimeInMs = endTime / 1000;
  } else if (endTime.toString().length === 13) {
    // if endTime in milliseconds
    endTimeInMs = endTime;
  } else if (endTime.toString().length === 10) {
    // if endTime in seconds
    endTimeInMs = endTime * 1000;
  } else if (endTime === 0) {
    return {
      full: "End date is already due.",
      short: "End date is already due.",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  } else {
    return {
      full: "Invalid timestamp",
      short: "Invalid timestamp",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const differenceInMs = new Date(endTimeInMs).getTime() - Date.now();
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
    full: `${days ? `${days}D:` : ""}${hours ? `${hours}H:` : ""}${minutes ? `${minutes}M:` : ""}${seconds}S`,
    short: `${days}D:${hours}H:${minutes}M`,
    days,
    hours,
    minutes,
    seconds,
  };
}
// endTime in calcTimePassed is a milisecond timestamp
export function calcTimePassed(endTime: number) {
  let differenceInMs = Date.now() - new Date(endTime).getTime();
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
// timeleft is seconds
export function calcSecondsLeft(timeleft: number) {
  if (0 >= timeleft)
    return {
      full: "Dispute ended.",
      short: "Dispute ended.",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  const days = Math.floor(timeleft / (60 * 60 * 24));
  const hours = Math.floor((timeleft % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((timeleft % (60 * 60)) / 60);
  const seconds = Math.floor(timeleft % 60);
  return {
    full: `${days ? `${days}D:` : ""}${hours ? `${hours}H:` : ""}${minutes ? `${minutes}M:` : ""}${seconds}S`,
    short: `${days}D:${hours}H:${minutes}M`,
    days,
    hours,
    minutes,
    seconds,
  };
}
