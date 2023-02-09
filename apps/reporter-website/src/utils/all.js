/** */
export const getFormattedDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export const dateRangeText = (dates) => {
  if (!Array.isArray(dates) || dates.length === 0) {
    return "TBD";
  }

  dates = dates.sort((a, b) => a - b);
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const endMonth = endDate.toLocaleString("default", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
}
