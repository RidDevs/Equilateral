// ─── DEFAULT TRANSACTIONS ────────────────────────────────────────────────────
export const SAMPLE_TRANSACTIONS = [];

// Budget allocations as percentage of total income (shown in Budget page & used for defaults)
export const BUDGET_PERCENTAGES = {
  Food: 0.20,
  Transport: 0.13,
  Shopping: 0.20,
  Bills: 0.17,
  Entertainment: 0.07,
  Health: 0.10,
};

export function getDefaultBudgets(totalIncome = 50000) {
  const income = totalIncome > 0 ? totalIncome : 50000;
  const budgets = {};
  for (const [cat, pct] of Object.entries(BUDGET_PERCENTAGES)) {
    budgets[cat] = Math.round(income * pct);
  }
  return budgets;
}

export const CATEGORY_COLORS = {
  Food: "#1D9E75",
  Transport: "#378ADD",
  Shopping: "#D85A30",
  Bills: "#BA7517",
  Entertainment: "#7F77DD",
  Health: "#D4537E",
  Income: "#639922",
};

export const KEYWORD_MAP = {
  Food:          ["zomato", "swiggy", "restaurant", "food", "hotel", "cafe", "blinkit", "dunzo"],
  Transport:     ["uber", "ola", "petrol", "fuel", "metro", "bus", "rapido", "cab"],
  Shopping:      ["amazon", "flipkart", "myntra", "ajio", "meesho", "mall", "purchase"],
  Bills:         ["electricity", "internet", "wifi", "recharge", "mobile", "broadband", "water"],
  Entertainment: ["netflix", "spotify", "prime", "hotstar", "movie", "ticket", "game"],
  Health:        ["pharmacy", "medicine", "hospital", "doctor", "gym", "clinic"],
  Income:        ["salary", "credit", "freelance", "payment received", "cashback"],
};

export const TABS = ["Dashboard", "Transactions", "AI Advisor", "Budgets","Bill Reminders","Add expense/income"];

export const SUGGESTIONS = [
  "Where am I overspending?",
  "How can I save ₹3,000 this month?",
  "Am I on track financially?",
  "What's my biggest financial risk?",
];
