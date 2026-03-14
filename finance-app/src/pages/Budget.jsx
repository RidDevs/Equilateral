import { useMemo, useState } from "react";
import { CATEGORY_COLORS, BUDGET_PERCENTAGES, getDefaultBudgets } from "../constants";

import { useFinance } from "../context/FinanceContext";

// ─── Budget ───────────────────────────────────────────────────────────────────
// Category limits and progress vs actual spending. Uses BUDGET_PERCENTAGES for defaults.

export default function Budget() {
  const { budgets, setBudgets, transactions, totalIncome } = useFinance();
  const [editCat, setEditCat] = useState(null);
  const catTotals = useMemo(() => {
    const t = {};
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        t[tx.category] = (t[tx.category] || 0) + Math.abs(tx.amount);
      });
    return t;
  }, [transactions]);

  const handleResetToDefaults = () => {
    setBudgets(getDefaultBudgets(totalIncome || 50000));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Monthly limits per category, derived from a percentage of your income.
          Bars turn red when you exceed your budget.
        </div>
        <button
          onClick={handleResetToDefaults}
          style={{
            padding: "6px 12px",
            background: "var(--border)",
            border: "none",
            borderRadius: 6,
            color: "var(--text)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Apply default allocation
        </button>
      </div>

      {Object.entries(budgets).map(([cat, limit]) => {
        const spent = catTotals[cat] || 0;
        const pct = Math.min((spent / limit) * 100, 100);
        const over = spent > limit;

        return (
          <div
            key={cat}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            {/* Category header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              {/* Left: dot + name + badge */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: CATEGORY_COLORS[cat] || "#888",
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--text)",
                  }}
                >
                  {cat}
                  {BUDGET_PERCENTAGES[cat] != null && (
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--muted)",
                        marginLeft: 6,
                        fontSize: 12,
                      }}
                    >
                      ({Math.round((BUDGET_PERCENTAGES[cat] || 0) * 100)}%)
                    </span>
                  )}
                </span>
                {over && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#E24B4A",
                      background: "#E24B4A22",
                      padding: "2px 7px",
                      borderRadius: 20,
                    }}
                  >
                    Over budget
                  </span>
                )}
              </div>

              {/* Right: spent / editable limit */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  ₹{Math.round(spent).toLocaleString("en-IN")} spent &nbsp;/&nbsp; limit:
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) =>
                    setBudgets((prev) => ({
                      ...prev,
                      [cat]: parseInt(e.target.value) || 0,
                    }))
                  }
                  style={{
                    width: 80,
                    padding: "4px 8px",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 8,
                background: "var(--border)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: over
                    ? "#E24B4A"
                    : pct > 80
                    ? "#BA7517"
                    : CATEGORY_COLORS[cat] || "#1D9E75",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
