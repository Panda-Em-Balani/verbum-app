import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CARD, BORDER, R, CARD_SHADOW_STRONG } from "../theme.js";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open dialogs, oldest first. Only the last one answers the keyboard.
const stack = [];
let pageOverflow = "";

// Modal dialog: traps focus, closes on Escape or a tap outside, and returns focus to
// whatever opened it. Rendered at the end of <body> so no card can clip it.
export default function Dialog({ open, onClose, label, placement = "center", children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const opener = document.activeElement;
    const id = {};
    stack.push(id);
    const focusables = () => [...panel.querySelectorAll(FOCUSABLE)];
    (focusables()[0] || panel).focus();

    const onKey = (e) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      } else if (e.key === "Tab") {
        const items = focusables();
        if (!items.length) { e.preventDefault(); return; }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !panel.contains(active))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (active === last || !panel.contains(active))) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    // The page stops scrolling while any dialog is open and scrolls again when the last
    // one closes (two dialogs can close in the same moment, in either order).
    if (stack.length === 1) pageOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
      if (stack.length === 0) document.body.style.overflow = pageOverflow;
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const bottom = placement === "bottom";
  return createPortal(
    <div
      // Clicks inside a dialog must not reach the card it was opened from.
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "center",
        alignItems: bottom ? "flex-end" : "center",
        padding: bottom ? "16px 16px max(24px, env(safe-area-inset-bottom))" : 16,
        background: "rgba(30,20,10,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 22, width: "100%", maxWidth: 414,
          maxHeight: "calc(100vh - 48px)", overflowY: "auto", boxShadow: CARD_SHADOW_STRONG, outline: "none",
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
