import { describe, it, expect } from "vitest";
import { getLiturgicalDay } from "./calendar.js";

const day = (y, m, d, h = 12, min = 0) => getLiturgicalDay(new Date(y, m - 1, d, h, min));

describe("getLiturgicalDay", () => {
  it("returns the celebration, rank, season and colour", async () => {
    expect(await day(2026, 11, 13)).toEqual({ dateKey: "2026-11-13", key: "fridayOfThe32ndWeekOfOrdinaryTime", name: "Friday of the 32nd week of Ordinary Time", rank: "FERIA", season: "ordinary", color: "green", source: "romcal" });
    expect(await day(2026, 1, 11)).toMatchObject({ key: "baptismOfTheLord", rank: "FEAST", season: "christmas", color: "white" });
    expect(await day(2026, 10, 15)).toMatchObject({ key: "saintTeresaOfJesusVirginAndDoctorOfTheChurch", rank: "MEMORIAL", season: "ordinary" });
    expect(await day(2026, 3, 4)).toMatchObject({ key: "saintCasimir", rank: "COMMEMORATION", season: "lent", color: "purple" });
    expect(await day(2025, 12, 14)).toMatchObject({ key: "3rdSundayOfAdvent", season: "advent", color: "rose" });
    expect(await day(2026, 4, 5)).toMatchObject({ key: "easter", rank: "SOLEMNITY", season: "easter", color: "white" });
    expect(await day(2026, 4, 3)).toMatchObject({ season: "holyWeek" });
  });

  it("uses local date near midnight", async () => {
    expect((await day(2026, 11, 13, 23, 59)).key).toBe("fridayOfThe32ndWeekOfOrdinaryTime");
    expect((await day(2026, 11, 14, 0, 1)).dateKey).toBe("2026-11-14");
  });

  it("falls back outside generated years", async () => {
    expect(await day(2040, 6, 1)).toMatchObject({ dateKey: "2040-06-01", key: null, rank: "FERIA", season: "ordinary", color: "green", source: "fallback" });
    expect(await day(2040, 12, 10)).toMatchObject({ season: "advent", color: "purple", source: "fallback" });
  });
});
