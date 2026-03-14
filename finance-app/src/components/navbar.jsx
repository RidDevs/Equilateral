import { TABS } from "../constants";

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Top navigation bar with app title and tab switcher.
// Props:
//   tab          (string)              — currently active tab
//   setTab       (fn)                  — tab setter
//   txCount      (number)              — transaction count shown in subtitle

export default function Navbar({ tab, setTab, txCount }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      {/* Title */}
      <div>
        <div
          style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          Finance Advisor
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
          {txCount} transactions · March 2025
        </div>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 4,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background: tab === t ? "#1D9E75" : "transparent",
              color: tab === t ? "#fff" : "var(--muted)",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
