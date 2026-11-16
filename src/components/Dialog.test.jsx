// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Dialog from "./Dialog.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

afterEach(cleanup);

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog open={open} onClose={() => setOpen(false)} label="Test dialog">
        <button>First</button>
        <button onClick={() => setOpen(false)}>Last</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    render(<Dialog open={false} onClose={() => {}} label="x"><p>hidden</p></Dialog>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape calls onClose", () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} label="x"><button>ok</button></Dialog>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("moves focus inside on open, and Tab from the last button moves focus to the first", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Open"));
    expect(document.activeElement).toBe(screen.getByText("First"));
    screen.getByText("Last").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("First"));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("Last"));
  });

  it("focus returns to the opener after close", () => {
    render(<Harness />);
    const opener = screen.getByText("Open");
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByText("Last"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("only the top dialog answers Escape", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Dialog open onClose={outer} label="outer"><button>a</button></Dialog>
        <Dialog open onClose={inner} label="inner"><button>b</button></Dialog>
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("ConfirmDialog calls onConfirm and onCancel from its buttons", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="Sign out of Verbum?" confirmLabel="Sign out" onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("Dialog scroll lock", () => {
  it("unlocks the page when two stacked dialogs close together", () => {
    function Both() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Dialog open={open} onClose={() => {}} label="sheet"><button onClick={() => setOpen(false)}>close both</button></Dialog>
          <Dialog open={open} onClose={() => {}} label="confirm"><button>x</button></Dialog>
        </>
      );
    }
    document.body.style.overflow = "";
    render(<Both />);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByText("close both"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
