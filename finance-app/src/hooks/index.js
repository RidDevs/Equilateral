import { KEYWORD_MAP } from "../constants";

// ─── FORMAT CURRENCY ─────────────────────────────────────────────────────────
export function fmt(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// ─── KEYWORD AUTO-CATEGORIZER ────────────────────────────────────────────────
export function categorize(description) {
  const d = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((k) => d.includes(k))) return cat;
  }
  return "Other";
}

// ─── CSV PARSER ──────────────────────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  return lines
    .slice(1)
    .map((line, i) => {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx] || "";
      });
      const desc =
        row.description ||
        row.narration ||
        row.details ||
        row.particulars ||
        "Transaction";
      const rawAmt =
        parseFloat(
          (row.amount || row.debit || row.credit || "0").replace(
            /[^0-9.-]/g,
            ""
          )
        ) || 0;
      const amount =
        row.type === "income" || row.credit
          ? Math.abs(rawAmt)
          : -Math.abs(rawAmt);
      return {
        id: Date.now() + i,
        date: row.date || new Date().toISOString().slice(0, 10),
        description: desc,
        amount,
        type: amount >= 0 ? "income" : "expense",
        category: categorize(desc),
      };
    })
    .filter((r) => r.amount !== 0);
}

// ─── BUILD AI SYSTEM PROMPT ───────────────────────────────────────────────────
export function buildSystemPrompt(transactions, budgets) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income");
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(
    expenses.reduce((s, t) => s + t.amount, 0)
  );
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;

  const catTotals = {};
  expenses.forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
  });

  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(
      ([cat, total]) =>
        `  ${cat}: ₹${Math.round(total)} (${Math.round(
          (total / totalExpenses) * 100
        )}% of expenses)`
    );

  const budgetStatus = Object.entries(budgets).map(([cat, limit]) => {
    const spent = catTotals[cat] || 0;
    const over = spent > limit;
    return `  ${cat}: ₹${Math.round(spent)} spent / ₹${limit} limit${
      over ? " ⚠ OVER BUDGET" : ""
    }`;
  });

  const topTx = [...expenses]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map((t) => `  ${t.date} — ${t.description}: ₹${Math.abs(t.amount)}`);

  return `You are a personal finance advisor for an Indian user.
Analyze their spending data and give specific, actionable advice.
Always reference actual numbers from their data. Keep responses to 3–5 sentences unless asked for more.
Suggest amounts in Indian Rupees (₹). Be direct, not generic.

=== SPENDING SUMMARY ===
Total income:   ₹${Math.round(totalIncome)}
Total expenses: ₹${Math.round(totalExpenses)}
Net savings:    ₹${Math.round(totalIncome - totalExpenses)}
Savings rate:   ${savingsRate}%

Top spending categories:
${topCats.join("\n")}

Budget status:
${budgetStatus.join("\n")}

Biggest transactions:
${topTx.join("\n")}`;
}

// ─── BUTTON STYLE HELPER ──────────────────────────────────────────────────────
export function btnStyle(color, ghost = false) {
  return {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: ghost ? "1px solid var(--border)" : "none",
    background: ghost ? "transparent" : color,
    color: ghost ? "var(--muted)" : "#fff",
    transition: "opacity 0.15s",
  };
}
