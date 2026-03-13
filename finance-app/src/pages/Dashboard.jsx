import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import StatCard from "../components/StatCard";
import { CATEGORY_COLORS } from "../constants";
import { fmt } from "../utils";

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Main overview page showing summary stats, spending pie chart, and budget bars.
// Props:
//   transactions  (array)  — all transactions
//   budgets       (object) — { category: limitAmount }

export default function Dashboard({ transactions, budgets }) {
  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = Math.abs(
      transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0)
    );
    const savings = income - expenses;
    const savingsRate =
      income > 0 ? Math.round((savings / income) * 100) : 0;
    return { income, expenses, savings, savingsRate };
  }, [transactions]);

  const catData = useMemo(() => {
    const totals = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
      });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const budgetData = useMemo(() => {
    const catTotals = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        catTotals[t.category] =
          (catTotals[t.category] || 0) + Math.abs(t.amount);
      });
    return Object.entries(budgets).map(([cat, limit]) => ({
      category: cat,
      spent: Math.round(catTotals[cat] || 0),
      limit,
      over: (catTotals[cat] || 0) > limit,
    }));
  }, [transactions, budgets]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Summary stat cards ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard
          label="Total income"
          value={fmt(stats.income)}
          color="#1D9E75"
        />
        <StatCard
          label="Total expenses"
          value={fmt(stats.expenses)}
          color="#D85A30"
        />
        <StatCard
          label="Net savings"
          value={fmt(stats.savings)}
          color={stats.savings >= 0 ? "#1D9E75" : "#E24B4A"}
        />
        <StatCard
          label="Savings rate"
          value={`${stats.savingsRate}%`}
          sub={
            stats.savingsRate >= 20 ? "On track" : "Below 20% target"
          }
          color={stats.savingsRate >= 20 ? "#1D9E75" : "#BA7517"}
        />
      </div>

      {/* ── Charts row ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        {/* Pie chart */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text)",
            }}
          >
            Spending by category
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={catData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {catData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] || "#888"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]}
              />
              <Legend
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Budget progress bars */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text)",
            }}
          >
            Budget status
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {budgetData.map(({ category, spent, limit, over }) => {
              const pct = Math.min((spent / limit) * 100, 100);
              return (
                <div key={category}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ color: "var(--text)", fontWeight: 500 }}
                    >
                      {category}
                    </span>
                    <span
                      style={{ color: over ? "#E24B4A" : "var(--muted)" }}
                    >
                      ₹{spent.toLocaleString("en-IN")} / ₹
                      {limit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--border)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 3,
                        background: over
                          ? "#E24B4A"
                          : pct > 80
                          ? "#BA7517"
                          : "#1D9E75",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
