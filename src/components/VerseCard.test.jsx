// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("../VerseShareButton.jsx", () => ({ default: () => <button type="button">Share</button> }));

import VerseCard from "./VerseCard.jsx";

afterEach(cleanup);

const verse = { id: 1, ref: "Psalm 23:1", text: "The Lord is my shepherd; there is nothing I lack.", category: ["peace"], explanation: "A reflection.", example: "A practice." };

describe("VerseCard", () => {
  it("the card toggles from its header button", () => {
    const onToggle = vi.fn();
    const { rerender } = render(<VerseCard verse={verse} expanded={false} onToggle={onToggle} isFav={false} onFav={() => {}} />);
    const header = screen.getByRole("button", { name: /The Lord is my shepherd/ });
    expect(header.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(header);
    expect(onToggle).toHaveBeenCalledTimes(1);
    rerender(<VerseCard verse={verse} expanded onToggle={onToggle} isFav={false} onFav={() => {}} />);
    expect(screen.getByRole("button", { name: /The Lord is my shepherd/ }).getAttribute("aria-expanded")).toBe("true");
  });

  it("the heart is not inside the toggle button and does not toggle the card", () => {
    const onToggle = vi.fn();
    const onFav = vi.fn();
    render(<VerseCard verse={verse} expanded={false} onToggle={onToggle} isFav={false} onFav={onFav} />);
    const heart = screen.getByRole("button", { name: "Save verse" });
    expect(heart.closest("button[aria-expanded]")).toBeNull();
    fireEvent.click(heart);
    expect(onFav).toHaveBeenCalledWith(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("collapsed content is inert", () => {
    const { rerender } = render(<VerseCard verse={verse} expanded={false} onToggle={() => {}} isFav={false} onFav={() => {}} />);
    const region = screen.getByText("A reflection.").closest("[data-collapse]");
    expect(region.hasAttribute("inert")).toBe(true);
    expect(region.getAttribute("aria-hidden")).toBe("true");
    rerender(<VerseCard verse={verse} expanded onToggle={() => {}} isFav={false} onFav={() => {}} />);
    expect(region.hasAttribute("inert")).toBe(false);
  });

  it("no div in the card is clickable", () => {
    const { container } = render(<VerseCard verse={verse} expanded onToggle={() => {}} isFav={false} onFav={() => {}} />);
    for (const div of container.querySelectorAll("div")) expect(div.style.cursor).not.toBe("pointer");
  });
});
