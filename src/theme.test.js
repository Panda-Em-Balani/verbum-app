import { describe, it, expect } from "vitest";
import { contrastRatio } from "./utils/contrast.js";
import * as T from "./theme.js";

describe("theme contrast", () => {
  it("text tokens meet AA on every background", () => {
    for (const fg of ["TEXT", "TEXT_BODY", "MUTED", "GOLD_TEXT", "SUCCESS", "DANGER"]) {
      for (const bg of ["PAGE_BG", "SURFACE", "CARD"]) {
        expect(contrastRatio(T[fg], T[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("button and header pairs meet AA", () => {
    const pairs = [
      [T.ON_GOLD, T.GOLD], [T.HEADER_TEXT, T.HEADER_BG], [T.SUCCESS, T.SUCCESS_BG],
      [T.MERCY.text, T.MERCY.bg], [T.MERCY.accent, T.MERCY.bg],
    ];
    for (const [fg, bg] of pairs) expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });

  it("contrastRatio('#000000', '#FFFFFF') rounds to 21", () => {
    expect(Math.round(contrastRatio("#000000", "#FFFFFF"))).toBe(21);
  });
});
