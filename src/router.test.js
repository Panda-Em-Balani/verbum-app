// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { matchRoute, tabOf, resolveLegacy, initRouter, navigate, goBack } from "./router.js";

const here = () => location.pathname + location.search + location.hash;
const nextPop = () => new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true }));

beforeEach(() => {
  history.replaceState(null, "", "/");
  initRouter();
});

describe("matchRoute", () => {
  it("matches every route", () => {
    const cases = {
      "/": "home", "/soul": "soul", "/explore": "explore", "/explore/saved": "exploreSaved",
      "/prayers": "prayers", "/prayers/rosary": "rosary", "/prayers/novenas": "novenas",
      "/prayers/three-oclock": "threeOclock", "/prayers/intentions": "intentions", "/mass": "mass", "/install": "install", "/reset-password": "resetPassword",
    };
    for (const [path, name] of Object.entries(cases)) {
      expect(matchRoute(path), path).toEqual({ name, params: {}, notFound: false });
    }
    expect(matchRoute("/prayers/novenas/divine-mercy")).toEqual({ name: "novena", params: { id: "divine-mercy" }, notFound: false });
    expect(matchRoute("/install/")).toEqual({ name: "install", params: {}, notFound: false });
  });

  it("unknown path is home with notFound", () => {
    expect(matchRoute("/nope")).toEqual({ name: "home", params: {}, notFound: true });
    expect(matchRoute("/prayers/novenas/a/b")).toEqual({ name: "home", params: {}, notFound: true });
  });

  it("tabOf groups sub-screens under their tab", () => {
    expect(tabOf("exploreSaved")).toBe("explore");
    for (const n of ["prayers", "rosary", "novenas", "novena", "threeOclock", "intentions"]) expect(tabOf(n)).toBe("prayers");
    expect(tabOf("home")).toBe("home");
    expect(tabOf("install")).toBeNull();
    expect(tabOf("resetPassword")).toBeNull();
  });
});

describe("resolveLegacy", () => {
  it("maps every legacy tab/section pair", () => {
    const cases = {
      "/?tab=prayers&section=three-oclock": "/prayers/three-oclock",
      "/?tab=prayers&section=rosary": "/prayers/rosary",
      "/?tab=prayers&section=novenas": "/prayers/novenas",
      "/?tab=home": "/", "/?tab=soul": "/soul", "/?tab=explore": "/explore", "/?tab=mass": "/mass",
      "/?tab=prayers": "/prayers", "/?tab=bogus": "/", "/?section=rosary": "/prayers/rosary",
    };
    for (const [from, to] of Object.entries(cases)) expect(resolveLegacy("https://x" + from), from).toBe(to);
  });

  it("keeps install query params", () => {
    expect(resolveLegacy("https://x/install?v=psalm-23-1&ref=share")).toBeNull();
    expect(resolveLegacy("https://x/?tab=home&ref=push")).toBe("/?ref=push");
    expect(resolveLegacy("https://x/prayers")).toBeNull();
  });
});

describe("history", () => {
  it("never touches the hash", () => {
    history.replaceState(null, "", "/?tab=home#access_token=abc&type=recovery");
    initRouter();
    expect(here()).toBe("/#access_token=abc&type=recovery");
    history.replaceState(null, "", "/#access_token=abc&type=magiclink");
    initRouter();
    expect(here()).toBe("/#access_token=abc&type=magiclink");
  });

  it("rewrites a legacy link on start", () => {
    history.replaceState(null, "", "/?tab=prayers&section=three-oclock");
    initRouter();
    expect(here()).toBe("/prayers/three-oclock");
  });

  it("navigate pushes and goBack returns", async () => {
    navigate("/prayers");
    navigate("/prayers/rosary");
    expect(here()).toBe("/prayers/rosary");
    const pop = nextPop();
    goBack("/prayers");
    await pop;
    expect(matchRoute(location.pathname).name).toBe("prayers");
  });

  it("goBack with no history uses the fallback with replace", () => {
    history.replaceState(null, "", "/prayers/novenas/divine-mercy");
    initRouter();
    const before = history.length;
    goBack("/prayers/novenas");
    expect(here()).toBe("/prayers/novenas");
    expect(history.length).toBe(before);
  });

  it("navigate with replace does not add an entry", () => {
    navigate("/explore");
    const before = history.length;
    navigate("/explore/saved", { replace: true });
    expect(here()).toBe("/explore/saved");
    expect(history.length).toBe(before);
  });
});

describe("malformed addresses", () => {
  it("does not throw on a badly encoded path", () => {
    expect(() => matchRoute("/prayers/novenas/%E0")).not.toThrow();
    expect(matchRoute("/prayers/novenas/%E0")).toMatchObject({ name: "novena", params: { id: "%E0" } });
  });
});
