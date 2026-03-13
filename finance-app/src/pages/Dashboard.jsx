import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import StatCard from "../components/StatCard";
import { CATEGORY_COLORS } from "../constants";
import { fmt, evaluateGoalFeasibility, btnStyle } from "../utils";

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Main overview page showing summary stats, spending pie chart, budget bars, and goals.
// Props:
//   transactions  (array)  — all transactions
//   budgets       (object) — { category: limitAmount }
//   goals         (array)  — savings goals
//   addGoal, updateGoal, addSavingsToGoal, deleteGoal

export default function Dashboard({
  transactions,
  budgets,
  goals = [],
  addGoal,
  updateGoal,
  addSavingsToGoal,
  deleteGoal,
}) {
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });
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

  const monthlySavings = useMemo(() => {
    const now = new Date();
    const income = transactions
      .filter((t) => t.type === "income")
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return income - expenses;
  }, [transactions]);

  const [trendRange, setTrendRange] = useState("week");

  const expenseTrendData = useMemo(() => {
    const now = new Date();
    const expenses = transactions.filter((t) => t.type === "expense");

    const makeKey = (d) => {
      if (trendRange === "week") return d.toISOString().slice(0, 10);
      if (trendRange === "month") return `${d.getFullYear()}-${d.getMonth()}`;
      return `${d.getFullYear()}`;
    };

    const labelFor = (d) => {
      if (trendRange === "week")
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (trendRange === "month")
        return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      return d.getFullYear().toString();
    };

    const sums = expenses.reduce((acc, t) => {
      const d = new Date(t.date);
      const key = makeKey(d);
      acc[key] = (acc[key] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

    const points = [];
    if (trendRange === "week") {
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = makeKey(d);
        points.push({ label: labelFor(d), value: Math.round(sums[key] || 0) });
      }
    } else if (trendRange === "month") {
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = makeKey(d);
        points.push({ label: labelFor(d), value: Math.round(sums[key] || 0) });
      }
    } else {
      for (let i = 4; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear() - i, 0, 1);
        const key = makeKey(d);
        points.push({ label: labelFor(d), value: Math.round(sums[key] || 0) });
      }
    }

    return points;
  }, [transactions, trendRange]);

  const topSpendingCats = useMemo(() => {
    const totals = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
      });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([c]) => c);
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

      {/* ── Savings Goals ── */}
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
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          Savings Goals
        </div>

        {/* Create goal form */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <input
            placeholder="Goal name (e.g. Emergency Fund)"
            value={goalForm.name}
            onChange={(e) =>
              setGoalForm((f) => ({ ...f, name: e.target.value }))
            }
            style={{
              flex: 1,
              minWidth: 140,
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <input
            type="number"
            placeholder="Target ₹"
            value={goalForm.targetAmount}
            onChange={(e) =>
              setGoalForm((f) => ({ ...f, targetAmount: e.target.value }))
            }
            style={{
              width: 120,
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <input
            type="date"
            placeholder="Deadline"
            value={goalForm.deadline}
            onChange={(e) =>
              setGoalForm((f) => ({ ...f, deadline: e.target.value }))
            }
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
          <button
            onClick={() => {
              if (goalForm.name && goalForm.targetAmount && goalForm.deadline) {
                addGoal({
                  name: goalForm.name,
                  targetAmount: goalForm.targetAmount,
                  deadline: goalForm.deadline,
                  currentSaved: 0,
                });
                setGoalForm({ name: "", targetAmount: "", deadline: "" });
              }
            }}
            disabled={
              !goalForm.name || !goalForm.targetAmount || !goalForm.deadline
            }
            style={btnStyle("#1D9E75")}
          >
            Add goal
          </button>
        </div>

        {/* Goal cards */}
        {goals.length === 0 ? (
          <div
            style={{
              color: "var(--muted)",
              fontSize: 13,
              padding: "12px 0",
            }}
          >
            Create a savings goal above, e.g. Emergency Fund – ₹100,000 by Dec
            2026.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {goals.map((g) => {
              const ev = evaluateGoalFeasibility(
                g,
                monthlySavings,
                topSpendingCats
              );
              const pct = Math.min(
                100,
                g.targetAmount > 0
                  ? Math.round(((g.currentSaved || 0) / g.targetAmount) * 100)
                  : 0
              );
              return (
                <div
                  key={g.id}
                  style={{
                    padding: 14,
                    background: "var(--hover)",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "var(--text)",
                        }}
                      >
                        {g.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {fmt(g.currentSaved || 0)} / {fmt(g.targetAmount)} · by{" "}
                        {new Date(g.deadline).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 20,
                        fontWeight: 500,
                        background: ev.onTrack ? "#1D9E7522" : "#E24B4A22",
                        color: ev.onTrack ? "#1D9E75" : "#E24B4A",
                      }}
                    >
                      {ev.onTrack ? "On track" : "Off track"}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "var(--border)",
                      borderRadius: 4,
                      overflow: "hidden",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 4,
                        background: ev.onTrack ? "#1D9E75" : "#BA7517",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 8,
                    }}
                  >
                    {ev.advice}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      type="number"
                      placeholder="Add savings ₹"
                      style={{
                        width: 100,
                        padding: "6px 10px",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        background: "var(--bg)",
                        color: "var(--text)",
                        fontSize: 12,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const amt = parseFloat(e.target.value);
                          if (amt > 0) {
                            addSavingsToGoal(g.id, amt);
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        const amt = parseFloat(input?.value || 0);
                        if (amt > 0) {
                          addSavingsToGoal(g.id, amt);
                          if (input) input.value = "";
                        }
                      }}
                      style={btnStyle("#1D9E75", true)}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      style={btnStyle("#888", true)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {/* ── Expense trends (week / month / year) ── */}
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
            marginBottom: 12,
            color: "var(--text)",
          }}
        >
          Expense trends
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { key: "week", label: "Last 7 days" },
            { key: "month", label: "Last 6 months" },
            { key: "year", label: "Last 5 years" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTrendRange(opt.key)}
              style={btnStyle(trendRange === opt.key ? "#1D9E75" : "#888", true)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={expenseTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted)" }} />
            <YAxis
              tickFormatter={(val) => (val ? `₹${val.toLocaleString("en-IN")}` : "")}
              tick={{ fontSize: 12, fill: "var(--muted)" }}
            />
            <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Expenses"]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#D85A30"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
