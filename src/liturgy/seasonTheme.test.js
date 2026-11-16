import { describe, it, expect } from "vitest";
import { seasonTheme } from "./seasonTheme.js";
import { contrastRatio } from "../utils/contrast.js";
import { HEADER_TEXT, TEXT, TEXT_BODY, MUTED } from "../theme.js";

const COLORS = ["green", "purple", "rose", "red", "white"];

describe("seasonTheme", () => {
  it("header text is readable on every season", () => {
    for (const c of COLORS) expect(contrastRatio(HEADER_TEXT, seasonTheme(c).header), c).toBeGreaterThanOrEqual(4.5);
  });
  it("text is readable on every tint", () => {
    for (const c of COLORS) {
      for (const fg of [TEXT, TEXT_BODY, MUTED]) expect(contrastRatio(fg, seasonTheme(c).tint), c).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(seasonTheme(c).accent, seasonTheme(c).tint), c + " accent").toBeGreaterThanOrEqual(3);
    }
  });
  it("unknown colour falls back to white", () => {
    expect(seasonTheme("teal")).toEqual(seasonTheme("white"));
    expect(seasonTheme(undefined)).toEqual(seasonTheme("white"));
  });
});
