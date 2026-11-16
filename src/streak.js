import { addDays } from "./utils/date.js";

// Works out the prayer streak from the days on which something was prayed.
//   current: consecutive prayed days ending today, or ending yesterday if nothing has been
//            prayed yet today (the streak is not broken until a whole day is missed).
//   last7:   the last seven days, oldest first, ending today.
export function computeStreak(dateKeys, todayKey) {
  const prayed = new Set(dateKeys);
  let day = prayed.has(todayKey) ? todayKey : addDays(todayKey, -1);
  let current = 0;
  while (prayed.has(day)) {
    current += 1;
    day = addDays(day, -1);
  }
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const dateKey = addDays(todayKey, -i);
    last7.push({ dateKey, prayed: prayed.has(dateKey) });
  }
  return { current, last7 };
}
