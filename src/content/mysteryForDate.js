// The traditional mysteries for each day of the week.
const BY_WEEKDAY = ["Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous", "Sorrowful", "Joyful"]; // Sunday first

export function mysteryForDate(date) {
  return BY_WEEKDAY[date.getDay()];
}
