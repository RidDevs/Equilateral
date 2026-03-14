import { TABS } from "../constants";

import { useFinance } from "../context/FinanceContext";

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Top navigation bar with app title and tab switcher.
// Props:
//   tab          (string)              — currently active tab
//   setTab       (fn)                  — tab setter

export default function Navbar({ tab, setTab }) {
  const { transactions } = useFinance();
  const txCount = transactions?.length || 0;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Title section */}
      <div>
        <div
          style={{
            fontSize: "clamp(20px, 5vw, 24px)",
            fontWeight: 600,
            letterSpacing: "-0.5px",
          }}
        >
          Finance Advisor
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
          {txCount} transactions · March 2025
        </div>
      </div>

      {/* Tab switcher - scrollable on mobile */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 4,
          overflowX: "auto",
          overflowY: "hidden",
          marginTop: 12,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 12px",
              borderRadius: 7,
              fontSize: "clamp(11px, 2.5vw, 13px)",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background: tab === t ? "#1D9E75" : "transparent",
              color: tab === t ? "#fff" : "var(--muted)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
