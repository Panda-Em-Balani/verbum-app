import { Component } from "react";
import { Cross } from "./Icons.jsx";
import { PAGE_BG, FONT_UI } from "../theme.js";
import { primaryButton } from "../styles/buttons.js";
import { cardTitle, secondary } from "../styles/text.js";

// Catches a crash in the screens below it (for example a screen's code failing to load after
// an update) and offers a reload instead of leaving a blank page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("[Verbum] screen failed:", error?.message);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const reload = this.props.onReload || (() => window.location.reload());
    return (
      <div role="alert" style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center", fontFamily: FONT_UI }}>
        <Cross size={32} />
        <div style={{ ...cardTitle, fontSize: 19 }}>Something went wrong</div>
        <p style={{ ...secondary, maxWidth: 300 }}>Verbum may have been updated while it was open. Reloading usually fixes it.</p>
        <button type="button" onClick={reload} style={{ ...primaryButton, width: "auto", padding: "13px 28px" }}>Reload Verbum</button>
      </div>
    );
  }
}
