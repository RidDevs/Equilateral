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

// ─── GOAL FEASIBILITY (rule-based) ────────────────────────────────────────────
export function evaluateGoalFeasibility(goal, monthlySavings, topSpendingCats = []) {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const remaining = Math.max(0, (goal.targetAmount || 0) - (goal.currentSaved || 0));
  const monthsLeft = Math.max(
    1,
    (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth())
  );
  const requiredPerMonth = remaining / monthsLeft;
  const onTrack = monthlySavings >= requiredPerMonth;
  const shortfall = Math.max(0, requiredPerMonth - monthlySavings);

  let advice = "";
  if (remaining <= 0) {
    advice = "Goal completed!";
  } else if (onTrack) {
    advice = "You're on track.";
  } else if (shortfall > 0) {
    advice = `Save ₹${Math.round(shortfall).toLocaleString("en-IN")} more per month to stay on target. Consider reducing spending in categories like ${topSpendingCats.slice(0, 2).join(", ") || "Food, Transport"} or extending your deadline.`;
  }

  return {
    onTrack,
    requiredPerMonth,
    remaining,
    monthsLeft,
    shortfall,
    advice,
  };
}

// ─── HIGHLIGHTS SUMMARY (for AI highlights API) ─────────────────────────────────
export function buildHighlightsSummary(transactions = [], budgets = {}, goals = []) {
  const tx = Array.isArray(transactions) ? transactions : [];
  const expenses = tx.filter((t) => t.type === "expense");
  const income = tx.filter((t) => t.type === "income");
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(expenses.reduce((s, t) => s + t.amount, 0));
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round(((savings / totalIncome) * 100)) : 0;

  const catTotals = {};
  expenses.forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
  });

  const categoryBreakdown = Object.entries(catTotals).map(([cat, total]) => ({
    category: cat,
    total: Math.round(total),
    pct: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
  }));

  const budgetStatus = Object.entries(budgets || {}).map(([cat, limit]) => ({
    category: cat,
    spent: Math.round(catTotals[cat] || 0),
    limit,
    over: (catTotals[cat] || 0) > limit,
  }));

  return {
    totalIncome: Math.round(totalIncome),
    totalExpenses,
    savings: Math.round(savings),
    savingsRate,
    categoryBreakdown,
    budgetStatus,
    goalsCount: Array.isArray(goals) ? goals.length : 0,
  };
}

// ─── RULE-BASED INSIGHTS (fallback when AI unavailable) ─────────────────────────
export function getRuleBasedInsights(transactions = [], budgets = {}) {
  const tx = Array.isArray(transactions) ? transactions : [];
  const expenses = tx.filter((t) => t.type === "expense");
  const income = tx.filter((t) => t.type === "income");
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(expenses.reduce((s, t) => s + t.amount, 0));
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round(((savings / totalIncome) * 100)) : 0;

  const catTotals = {};
  expenses.forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
  });

  const insights = [];

  if (savingsRate < 20 && totalIncome > 0) {
    insights.push({
      type: "warning",
      title: "Low savings rate",
      body: `Your savings rate is ${savingsRate}%. Aim for at least 20% to build a safety net.`,
      category: "savings",
    });
  } else if (savingsRate >= 20) {
    insights.push({
      type: "tip",
      title: "Good savings habit",
      body: `You're saving ${savingsRate}% of income. Keep it up!`,
      category: "savings",
    });
  }

  Object.entries(budgets || {}).forEach(([cat, limit]) => {
    const spent = catTotals[cat] || 0;
    if (spent > limit) {
      insights.push({
        type: "warning",
        title: `Over budget: ${cat}`,
        body: `You've spent ₹${Math.round(spent).toLocaleString("en-IN")} vs ₹${limit.toLocaleString("en-IN")} limit.`,
        category: "budgeting",
      });
    }
  });

  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCat && totalExpenses > 0) {
    const pct = Math.round((topCat[1] / totalExpenses) * 100);
    if (pct > 40) {
      insights.push({
        type: "info",
        title: `Top spending: ${topCat[0]}`,
        body: `${topCat[0]} is ${pct}% of your expenses. Consider tracking it closely.`,
        category: "spending",
      });
    }
  }

  if (insights.length === 0 && tx.length > 0) {
    insights.push({
      type: "tip",
      title: "You're on track",
      body: "No major alerts. Keep tracking your spending.",
      category: "overview",
    });
  }

  return insights;
}

// ─── BUILD AI SYSTEM PROMPT ───────────────────────────────────────────────────
export function buildSystemPrompt(transactions = [], budgets = {}, goals = []) {
  const tx = Array.isArray(transactions) ? transactions : [];
  const expenses = tx.filter((t) => t.type === "expense");
  const income = tx.filter((t) => t.type === "income");
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

  const budgetStatus = Object.entries(budgets || {}).map(([cat, limit]) => {
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

  const now = new Date();
  const thisMonthIncome = income
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);
  const thisMonthExpenses = Math.abs(
    expenses
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0)
  );
  const monthlySavings = thisMonthIncome - thisMonthExpenses;

  const topCatNames = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([c]) => c);

  const goalLines = goals.map((g) => {
    const ev = evaluateGoalFeasibility(g, monthlySavings, topCatNames);
    const pct = g.targetAmount > 0
      ? Math.round(((g.currentSaved || 0) / g.targetAmount) * 100)
      : 0;
    return `  ${g.name}: ₹${(g.currentSaved || 0).toLocaleString("en-IN")} / ₹${g.targetAmount.toLocaleString("en-IN")} (${pct}%) — ${ev.onTrack ? "On track" : "Off track"} — ${ev.advice}`;
  });

  const goalsBlock =
    goalLines.length > 0
      ? `\nSavings goals:\n${goalLines.join("\n")}`
      : "";

  return `You are a personal finance advisor for an Indian user.
Analyze their spending data and give specific, actionable advice.
Always reference actual numbers from their data. Keep responses to 3–5 sentences unless asked for more.
Suggest amounts in Indian Rupees (₹). Be direct, not generic.

=== ADDING TRANSACTIONS ===
When the user asks you to ADD, LOG, or RECORD a transaction (expense or income), you MUST include a JSON block in your response using this exact format:

\`\`\`json
[TRANSACTIONS]
[
  {
    "description": "Short description of the transaction",
    "amount": 500,
    "type": "expense",
    "category": "Food"
  }
]
\`\`\`

Rules for the JSON block:
- "amount" must be a positive number (no sign, no currency symbol).
- "type" must be "expense" or "income".
- "category" must be one of: Food, Transport, Shopping, Bills, Entertainment, Health, Income, Other.
  For income transactions, use "Income" as the category.
- You may include multiple transactions in the array if the user asks for more than one.
- ALWAYS include a short, friendly confirmation message OUTSIDE the JSON block so the user knows what was added.
- If the user's request is ambiguous, ask for clarification instead of guessing.

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
${topTx.join("\n")}
${goalsBlock}`;
}

// ─── PARSE TRANSACTIONS FROM AI REPLY ─────────────────────────────────────────
// Extracts a [TRANSACTIONS] JSON block from an AI reply string.
// Returns { transactions: [...], cleanReply: "..." }
export function parseTransactionsFromReply(reply) {
  const result = { transactions: [], cleanReply: reply };
  if (!reply) return result;

  // Match ```json\n[TRANSACTIONS]\n[...]\n```
  const regex = /```json\s*\n\s*\[TRANSACTIONS\]\s*\n([\s\S]*?)```/;
  const match = reply.match(regex);
  if (!match) return result;

  try {
    const parsed = JSON.parse(match[1].trim());
    const arr = Array.isArray(parsed) ? parsed : [parsed];

    const VALID_CATEGORIES = [
      "Food", "Transport", "Shopping", "Bills",
      "Entertainment", "Health", "Income", "Other",
    ];

    const today = new Date().toISOString().slice(0, 10);

    const txns = arr
      .filter((t) => t && typeof t.amount === "number" && t.amount > 0 && t.description)
      .map((t, i) => ({
        id: Date.now() + i,
        date: t.date || today,
        description: t.description,
        amount: t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount),
        type: t.type === "income" ? "income" : "expense",
        category: VALID_CATEGORIES.includes(t.category) ? t.category : categorize(t.description),
      }));

    if (txns.length > 0) {
      result.transactions = txns;
      // Strip the JSON block from the displayed reply
      result.cleanReply = reply.replace(regex, "").trim();
    }
  } catch {
    // JSON parse failed — return original reply as-is
  }

  return result;
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
