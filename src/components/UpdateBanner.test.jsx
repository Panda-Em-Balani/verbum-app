// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import UpdateBanner from "./UpdateBanner.jsx";

afterEach(cleanup);

describe("UpdateBanner", () => {
  it("does not reload until Refresh is tapped", () => {
    const apply = vi.fn();
    const onDismiss = vi.fn();
    render(<UpdateBanner apply={apply} onDismiss={onDismiss} />);
    expect(screen.getByRole("status").textContent).toContain("A new version of Verbum is ready.");
    expect(apply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Later" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(apply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
