import { describe, it, expect } from "vitest";
import { getLiturgicalDay } from "./calendar.js";
import { pickForDay, RANK_LABEL, SEASON_TEXT } from "./match.js";
import { SAINTS } from "../content/saints.js";
import { HAPPENINGS } from "../content/happenings.js";

const day = (y, m, d) => getLiturgicalDay(new Date(y, m - 1, d, 12));
const saint = async (y, m, d) => pickForDay(await day(y, m, d), SAINTS);
const happening = async (y, m, d) => pickForDay(await day(y, m, d), HAPPENINGS);

describe("pickForDay", () => {
  it("finds the saint of a memorial by key", async () => {
    const hit = await saint(2026, 10, 15);
    expect(hit.item.name).toBe("Saint Teresa of Avila");
    expect(hit.by).toBe("key");
  });

  it("shows nothing on an ordinary weekday with no entry", async () => {
    expect(await saint(2026, 11, 13)).toBeNull();
    expect(await happening(2026, 11, 13)).toBeNull();
  });

  it("follows moveable feasts", async () => {
    expect((await happening(2026, 1, 11)).item.title).toBe("Baptism of the Lord");
    expect((await happening(2027, 1, 10)).item.title).toBe("Baptism of the Lord");
    expect(await happening(2026, 1, 13)).toBeNull(); // the old fixed date
    expect((await happening(2026, 1, 4)).item.title).toBe("The Epiphany of the Lord");
  });

  it("matches solemnities and commemorations", async () => {
    expect((await saint(2026, 6, 29)).item.name).toBe("Saint Peter");
    expect((await happening(2026, 3, 4)).item.title).toBe("Feast of Saint Casimir");
  });

  it("matches entries outside the general calendar by date on weekdays and optional memorials", async () => {
    expect(await saint(2026, 7, 14)).toMatchObject({ by: "date", item: { name: "Saint Kateri Tekakwitha" } });
    expect(await saint(2026, 7, 18)).toMatchObject({ by: "date", item: { name: "Saint Camillus de Lellis" } });
    expect(await saint(2026, 10, 5)).toMatchObject({ by: "date", item: { name: "Saint Faustina Kowalska" } });
  });

  it("a Sunday or higher feast displaces a saint", async () => {
    expect(await saint(2026, 10, 4)).toBeNull(); // Francis of Assisi falls on a Sunday in 2026
    expect((await saint(2027, 10, 4)).item.name).toBe("Saint Francis of Assisi");
    expect(await happening(2026, 4, 2)).toBeNull(); // 2 April 2026 is Holy Thursday
  });

  it("every saint and happening with a romcalKey matches at least once in 2026-2029", async () => {
    const keys = new Set();
    for (const y of [2026, 2027, 2028, 2029]) { // a saint can be displaced two years running (Anthony of Padua 2026-27)
      for (let d = new Date(y, 0, 1, 12); d.getFullYear() === y; d.setDate(d.getDate() + 1)) {
        keys.add((await getLiturgicalDay(new Date(d))).key);
      }
    }
    const missing = [...SAINTS, ...HAPPENINGS].filter((x) => x.romcalKey && !keys.has(x.romcalKey)).map((x) => x.name || x.title);
    expect(missing).toEqual([]);
  });

  it("has a label for every rank and text for every season", () => {
    for (const r of ["SOLEMNITY", "FEAST", "MEMORIAL", "OPT_MEMORIAL", "COMMEMORATION", "SUNDAY", "FERIA", "HOLY_WEEK", "TRIDUUM"]) expect(RANK_LABEL[r]).toBeTruthy();
    for (const s of ["advent", "christmas", "lent", "holyWeek", "easter", "ordinary"]) expect(SEASON_TEXT[s].name && SEASON_TEXT[s].desc).toBeTruthy();
  });
});
