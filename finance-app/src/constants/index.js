// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
export const SAMPLE_TRANSACTIONS = [
  { id: 1,  date: "2025-03-01", description: "Salary credit",         amount: 65000, type: "income",  category: "Income" },
  { id: 2,  date: "2025-03-02", description: "Zomato order",          amount: -480,  type: "expense", category: "Food" },
  { id: 3,  date: "2025-03-03", description: "Uber ride",             amount: -220,  type: "expense", category: "Transport" },
  { id: 4,  date: "2025-03-04", description: "Amazon purchase",       amount: -1850, type: "expense", category: "Shopping" },
  { id: 5,  date: "2025-03-05", description: "Swiggy order",          amount: -350,  type: "expense", category: "Food" },
  { id: 6,  date: "2025-03-06", description: "Electricity bill",      amount: -1200, type: "expense", category: "Bills" },
  { id: 7,  date: "2025-03-07", description: "Netflix subscription",  amount: -649,  type: "expense", category: "Entertainment" },
  { id: 8,  date: "2025-03-08", description: "Zomato order",          amount: -620,  type: "expense", category: "Food" },
  { id: 9,  date: "2025-03-09", description: "Petrol",                amount: -800,  type: "expense", category: "Transport" },
  { id: 10, date: "2025-03-10", description: "Flipkart order",        amount: -2200, type: "expense", category: "Shopping" },
  { id: 11, date: "2025-03-11", description: "Gym membership",        amount: -1500, type: "expense", category: "Health" },
  { id: 12, date: "2025-03-12", description: "Swiggy order",          amount: -410,  type: "expense", category: "Food" },
  { id: 13, date: "2025-03-13", description: "Ola ride",              amount: -185,  type: "expense", category: "Transport" },
  { id: 14, date: "2025-03-14", description: "Mobile recharge",       amount: -299,  type: "expense", category: "Bills" },
  { id: 15, date: "2025-03-15", description: "Zomato order",          amount: -730,  type: "expense", category: "Food" },
  { id: 16, date: "2025-03-16", description: "Freelance payment",     amount: 12000, type: "income",  category: "Income" },
  { id: 17, date: "2025-03-17", description: "Amazon order",          amount: -950,  type: "expense", category: "Shopping" },
  { id: 18, date: "2025-03-18", description: "Pharmacy",              amount: -380,  type: "expense", category: "Health" },
  { id: 19, date: "2025-03-19", description: "Uber ride",             amount: -310,  type: "expense", category: "Transport" },
  { id: 20, date: "2025-03-20", description: "Swiggy order",          amount: -520,  type: "expense", category: "Food" },
  { id: 21, date: "2025-03-21", description: "Internet bill",         amount: -899,  type: "expense", category: "Bills" },
  { id: 22, date: "2025-03-22", description: "Spotify",               amount: -119,  type: "expense", category: "Entertainment" },
  { id: 23, date: "2025-03-23", description: "Zomato order",          amount: -890,  type: "expense", category: "Food" },
  { id: 24, date: "2025-03-24", description: "Petrol",                amount: -750,  type: "expense", category: "Transport" },
  { id: 25, date: "2025-03-25", description: "Myntra shopping",       amount: -1600, type: "expense", category: "Shopping" },
  { id: 26, date: "2025-03-26", description: "Zomato order",          amount: -460,  type: "expense", category: "Food" },
  { id: 27, date: "2025-03-27", description: "Movie tickets",         amount: -600,  type: "expense", category: "Entertainment" },
  { id: 28, date: "2025-03-28", description: "Swiggy order",          amount: -390,  type: "expense", category: "Food" },
  { id: 29, date: "2025-03-29", description: "Electricity advance",   amount: -500,  type: "expense", category: "Bills" },
  { id: 30, date: "2025-03-30", description: "Uber ride",             amount: -260,  type: "expense", category: "Transport" },
];

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

export const TABS = ["Dashboard", "Transactions", "AI Advisor", "Budgets","Add expense/income",];

export const SUGGESTIONS = [
  "Where am I overspending?",
  "How can I save ₹3,000 this month?",
  "Am I on track financially?",
  "What's my biggest financial risk?",
];
