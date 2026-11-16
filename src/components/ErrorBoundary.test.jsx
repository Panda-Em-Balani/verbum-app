// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary.jsx";

afterEach(cleanup);

function Boom() { throw new Error("Failed to fetch dynamically imported module"); }

describe("ErrorBoundary", () => {
  it("shows a reload screen instead of a blank page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const onReload = vi.fn();
    render(<ErrorBoundary onReload={onReload}><Boom /></ErrorBoundary>);
    expect(screen.getByRole("alert").textContent).toContain("Something went wrong");
    fireEvent.click(screen.getByRole("button", { name: "Reload Verbum" }));
    expect(onReload).toHaveBeenCalledTimes(1);
    quiet.mockRestore();
  });

  it("renders its children when nothing fails", () => {
    render(<ErrorBoundary><p>fine</p></ErrorBoundary>);
    expect(screen.getByText("fine")).toBeTruthy();
  });
});
