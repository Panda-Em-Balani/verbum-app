// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";

const h = vi.hoisted(() => ({ intentions: new Map() }));
vi.mock("../../progress.js", () => ({
  INTENTION_MAX: 500,
  useProgress: () => ({ intentions: h.intentions }),
  addIntention: vi.fn(() => "new-id"),
  toggleIntentionAnswered: vi.fn(),
  deleteIntention: vi.fn(),
}));
vi.mock("../../router.js", () => ({ goBack: vi.fn() }));

import { addIntention, toggleIntentionAnswered, deleteIntention } from "../../progress.js";
import IntentionsView from "./IntentionsView.jsx";

beforeEach(() => { vi.clearAllMocks(); h.intentions = new Map(); });
afterEach(cleanup);

describe("IntentionsView", () => {
  it("shows the empty state", () => {
    render(<IntentionsView />);
    expect(screen.getByText("Write down what you are praying for. Only you can see these.")).toBeTruthy();
  });

  it("Add is disabled for blank text", () => {
    render(<IntentionsView />);
    const add = screen.getByRole("button", { name: "Add intention" });
    expect(add.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/new intention/i), { target: { value: "   " } });
    expect(add.disabled).toBe(true);
  });

  it("adds an intention and clears the box", () => {
    render(<IntentionsView />);
    const box = screen.getByLabelText(/new intention/i);
    fireEvent.change(box, { target: { value: "For peace at home" } });
    expect(screen.getByText("17/500")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add intention" }));
    expect(addIntention).toHaveBeenCalledWith("For peace at home");
    expect(box.value).toBe("");
  });

  it("lists newest first and marks answered", () => {
    h.intentions = new Map([
      ["a", { text: "Older", createdAt: "2026-11-01T10:00:00.000Z", answeredAt: null }],
      ["b", { text: "Newer", createdAt: "2026-11-10T10:00:00.000Z", answeredAt: null }],
    ]);
    render(<IntentionsView />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText("Newer")).toBeTruthy();
    fireEvent.click(within(items[0]).getByRole("button", { name: "Mark answered" }));
    expect(toggleIntentionAnswered).toHaveBeenCalledWith("b");
  });

  it("delete asks first and only deletes on confirm", () => {
    h.intentions = new Map([["a", { text: "Something", createdAt: "2026-11-01T10:00:00.000Z", answeredAt: null }]]);
    render(<IntentionsView />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteIntention).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Delete this intention?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(deleteIntention).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Delete this intention?" })).getByRole("button", { name: "Delete" }));
    expect(deleteIntention).toHaveBeenCalledWith("a");
  });
});
