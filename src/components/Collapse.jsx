// Animated open/close for expandable content. The content stays in the page (so it can
// animate) but is hidden from screen readers and the keyboard while closed.
export default function Collapse({ open, children }) {
  return (
    <div data-collapse aria-hidden={!open} inert={!open} style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 200ms ease" }}>
      <div style={{ overflow: "hidden", minHeight: 0 }}>{children}</div>
    </div>
  );
}
