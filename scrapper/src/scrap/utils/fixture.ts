export const stripMatchInfo = (info: string) => {
  if (info == "") {
    return {
      date: null,
      venue: null,
    };
  }
  info.trim();
  if (!info.startsWith("•")) {
    info = "•" + info;
  }
  let splitInfo = info.split("•");
  let start_time = splitInfo ? splitInfo[2].replace("(IST)", "").trim() : null;

  let dateStr = splitInfo[1];
  if (dateStr.includes("-")) {
    let dateStrSplit = dateStr.split("-");
    let monthSplit = dateStrSplit[1].trim().split(" ");
    dateStr = `${dateStrSplit[0].trim()} ${monthSplit[1]} ${monthSplit[2]}`;
  }

  let date = splitInfo
    ? (() => {
        let time_split = start_time && start_time.split(":");
        let dateUTC = new Date(dateStr);
        dateUTC.setHours(parseInt(time_split ? time_split[0] : "00"));
        dateUTC.setMinutes(parseInt(time_split ? time_split[1] : "00"));
        return dateUTC;
      })()
    : null;
  let venue = splitInfo ? splitInfo[3].trim() : null;

  return {
    date,
    venue,
  };
};
