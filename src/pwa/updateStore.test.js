import { describe, it, expect, vi } from "vitest";
import { setUpdate, clearUpdate, getUpdate, subscribeUpdate } from "./updateStore.js";

describe("updateStore", () => {
  it("holds the pending update and tells subscribers", () => {
    const listener = vi.fn();
    const stop = subscribeUpdate(listener);
    const apply = () => {};
    expect(getUpdate()).toBeNull();
    setUpdate(apply);
    expect(getUpdate()).toBe(apply);
    clearUpdate();
    expect(getUpdate()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
  });
});
