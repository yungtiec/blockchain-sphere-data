const getFormattedDate = date => {
  if (date !== "CURRENT") return Number(date);
  var today = new Date(),
    dd = today.getDate(),
    mm = today.getMonth() + 1; //January is 0!,
  yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return Number("" + yyyy + mm + dd);
};

const checkDateOverlap = (aDates, bDates) => {
  aDates.start_date = aDates.start_date || 20100101
  bDates.start_date = bDates.start_date || 20100101
  aDates.end_date = aDates.end_date || "CURRENT"
  bDates.end_date = bDates.end_date || "CURRENT"
  if (aDates.hide_date || bDates.hide_date) return false; // don't have enough info on their tenure terms
  // https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
  // (StartA <= EndB) and (EndA >= StartB)
  return (
    getFormattedDate(aDates.start_date) <= getFormattedDate(bDates.end_date) &&
    getFormattedDate(aDates.end_date) >= getFormattedDate(bDates.start_date)
  );
};

module.exports = {
  checkDateOverlap
};
