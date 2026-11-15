// Live Mass streams.
// embedUrl: plays inside the app (YouTube "live_stream" embeds follow whatever the channel
//   is broadcasting now). null = this stream opens on its own site instead.
// watchUrl: always offered as a fallback link, because embeds can be blocked or offline.
export const STREAMS = [
  {
    id: "vatican",
    label: "Vatican News — Papal Mass",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCz6g_U1LHLQNR6vT0ENPMbA",
    watchUrl: "https://www.youtube.com/channel/UCz6g_U1LHLQNR6vT0ENPMbA/live",
    watchLabel: "Open it in YouTube",
    note: "Live Masses from St. Peter's Basilica, including Papal celebrations and daily Vatican liturgies.",
    icon: "cross",
  },
  {
    id: "ewtn",
    label: "EWTN — Global Catholic Network",
    embedUrl: null,
    watchUrl: "https://www.ewtn.com/tv/watch-live",
    watchLabel: "Watch on EWTN",
    note: "Daily Mass, the Holy Rosary, and Catholic programming broadcast 24 hours a day worldwide.",
    icon: "broadcast",
  },
  {
    id: "saltlight",
    label: "Salt + Light — Catholic TV",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCHHmjz7kliVPUCkqMxRLWlA",
    watchUrl: "https://www.youtube.com/channel/UCHHmjz7kliVPUCkqMxRLWlA/live",
    watchLabel: "Open it in YouTube",
    note: "Daily Mass and Catholic news from Salt + Light Television in Canada.",
    icon: "broadcast",
  },
];

// A directory of Mass, Confession and Adoration times worldwide.
export const MASS_TIMES_URL = "https://masstimes.org/";
