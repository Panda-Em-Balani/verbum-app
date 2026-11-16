import { useEffect, useState } from "react";
import { msUntilMidnight } from "../utils/date.js";
import { getLiturgicalDay } from "./calendar.js";

// Today's liturgical day, or null until it has loaded. Rolls over at local midnight.
export function useLiturgicalDay() {
  const [day, setDay] = useState(null);
  useEffect(() => {
    let active = true;
    let timer;
    const load = () => {
      const now = new Date();
      getLiturgicalDay(now).then((d) => { if (active) setDay(d); });
      timer = setTimeout(load, msUntilMidnight(now) + 1000);
    };
    load();
    // A phone can pause timers while the app is in the background, so also check on return.
    const onVisible = () => { if (document.visibilityState === "visible") { clearTimeout(timer); load(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  return day;
}
