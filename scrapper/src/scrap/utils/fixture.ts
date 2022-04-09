export const stripMatchInfo = (info: string) => {
  if (info == "") {
    return {
      date: null,
      venue: null,
    };
  }
  let splitInfo = info.split("•");
  let start_time = splitInfo
    ? splitInfo[1]?.replace("(IST)", "")?.trim()
    : null;

  let date = splitInfo
    ? (() => {
        let time_split = start_time?.split(":");
        let dateUTC = new Date(splitInfo[0]);
        dateUTC.setHours(parseInt(time_split ? time_split[0] : "00"));
        dateUTC.setMinutes(parseInt(time_split ? time_split[1] : "00"));
        return dateUTC;
      })()
    : null;
  let venue = splitInfo ? splitInfo[2]?.trim() : null;

  return {
    date,
    venue,
  };
};
