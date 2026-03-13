import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const SAMPLE_TRANSACTIONS = [
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

const DEFAULT_BUDGETS = {
  Food: 3000, Transport: 2000, Shopping: 3000,
  Bills: 2500, Entertainment: 1000, Health: 1500,
};

const CATEGORY_COLORS = {
  Food: "#1D9E75", Transport: "#378ADD", Shopping: "#D85A30",
  Bills: "#BA7517", Entertainment: "#7F77DD", Health: "#D4537E",
  Income: "#639922",
};

// ─── KEYWORD AUTO-CATEGORIZER ────────────────────────────────────────────────
const KEYWORD_MAP = {
  Food:          ["zomato", "swiggy", "restaurant", "food", "hotel", "cafe", "blinkit", "dunzo"],
  Transport:     ["uber", "ola", "petrol", "fuel", "metro", "bus", "rapido", "cab"],
  Shopping:      ["amazon", "flipkart", "myntra", "ajio", "meesho", "mall", "purchase"],
  Bills:         ["electricity", "internet", "wifi", "recharge", "mobile", "broadband", "water"],
  Entertainment: ["netflix", "spotify", "prime", "hotstar", "movie", "ticket", "game"],
  Health:        ["pharmacy", "medicine", "hospital", "doctor", "gym", "clinic"],
  Income:        ["salary", "credit", "freelance", "payment received", "cashback"],
};

function categorize(description) {
  const d = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(k => d.includes(k))) return cat;
  }
  return "Other";
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_transactions");
      return saved ? JSON.parse(saved) : SAMPLE_TRANSACTIONS;
    } catch { return SAMPLE_TRANSACTIONS; }
  });

  useEffect(() => {
    localStorage.setItem("fin_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransactions = useCallback((newTxns) => {
    setTransactions(prev => [...prev, ...newTxns]);
  }, []);

  const resetToSample = useCallback(() => {
    setTransactions(SAMPLE_TRANSACTIONS);
  }, []);

  return { transactions, addTransactions, resetToSample };
}

// ─── CSV PARSER ──────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
    const desc = row.description || row.narration || row.details || row.particulars || "Transaction";
    const rawAmt = parseFloat((row.amount || row.debit || row.credit || "0").replace(/[^0-9.-]/g, "")) || 0;
    const amount = (row.type === "income" || row.credit) ? Math.abs(rawAmt) : -Math.abs(rawAmt);
    return {
      id: Date.now() + i,
      date: row.date || new Date().toISOString().slice(0, 10),
      description: desc,
      amount,
      type: amount >= 0 ? "income" : "expense",
      category: categorize(desc),
    };
  }).filter(r => r.amount !== 0);
}

// ─── BUILD SYSTEM PROMPT ─────────────────────────────────────────────────────
function buildSystemPrompt(transactions, budgets) {
  const expenses = transactions.filter(t => t.type === "expense");
  const income = transactions.filter(t => t.type === "income");
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(expenses.reduce((s, t) => s + t.amount, 0));
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const catTotals = {};
  expenses.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
  });
  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, total]) => `  ${cat}: ₹${Math.round(total)} (${Math.round((total / totalExpenses) * 100)}% of expenses)`);

  const budgetStatus = Object.entries(budgets).map(([cat, limit]) => {
    const spent = catTotals[cat] || 0;
    const over = spent > limit;
    return `  ${cat}: ₹${Math.round(spent)} spent / ₹${limit} limit${over ? " ⚠ OVER BUDGET" : ""}`;
  });

  const topTx = [...expenses]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map(t => `  ${t.date} — ${t.description}: ₹${Math.abs(t.amount)}`);

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

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || "var(--text)", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Dashboard({ transactions, budgets }) {
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = Math.abs(transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    return { income, expenses, savings, savingsRate };
  }, [transactions]);

  const catData = useMemo(() => {
    const totals = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const budgetData = useMemo(() => {
    const catTotals = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(budgets).map(([cat, limit]) => ({
      category: cat,
      spent: Math.round(catTotals[cat] || 0),
      limit,
      over: (catTotals[cat] || 0) > limit,
    }));
  }, [transactions, budgets]);

  const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total income" value={fmt(stats.income)} color="#1D9E75" />
        <StatCard label="Total expenses" value={fmt(stats.expenses)} color="#D85A30" />
        <StatCard label="Net savings" value={fmt(stats.savings)} color={stats.savings >= 0 ? "#1D9E75" : "#E24B4A"} />
        <StatCard label="Savings rate" value={`${stats.savingsRate}%`} sub={stats.savingsRate >= 20 ? "On track" : "Below 20% target"} color={stats.savingsRate >= 20 ? "#1D9E75" : "#BA7517"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>Spending by category</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {catData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#888"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
              <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>Budget status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {budgetData.map(({ category, spent, limit, over }) => {
              const pct = Math.min((spent / limit) * 100, 100);
              return (
                <div key={category}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>{category}</span>
                    <span style={{ color: over ? "#E24B4A" : "var(--muted)" }}>
                      ₹{spent.toLocaleString("en-IN")} / ₹{limit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`, borderRadius: 3,
                      background: over ? "#E24B4A" : pct > 80 ? "#BA7517" : "#1D9E75",
                      transition: "width 0.3s ease",
                    }} />
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

function Transactions({ transactions, onImport, onReset }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const fileRef = useRef();

  const categories = ["All", ...new Set(transactions.map(t => t.category))];

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "All" || t.category === catFilter;
      return matchSearch && matchCat;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, catFilter]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length > 0) onImport(parsed);
      else alert("Could not parse CSV. Check format: date, description, amount columns.");
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", color: "var(--text)", fontSize: 13 }}
        />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", color: "var(--text)", fontSize: 13 }}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => fileRef.current.click()} style={btnStyle("#1D9E75")}>
          Import CSV
        </button>
        <button onClick={onReset} style={btnStyle("#888", true)}>
          Reset to sample
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Description", "Category", "Amount"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "Amount" ? "right" : "left", color: "var(--muted)", fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 16px", color: "var(--muted)" }}>{t.date}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text)" }}>{t.description}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500,
                      background: (CATEGORY_COLORS[t.category] || "#888") + "22",
                      color: CATEGORY_COLORS[t.category] || "#888",
                    }}>{t.category}</span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 500, color: t.type === "income" ? "#1D9E75" : "#E24B4A" }}>
                    {t.type === "income" ? "+" : ""}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          Showing {Math.min(filtered.length, 50)} of {filtered.length} transactions
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Where am I overspending?",
  "How can I save ₹3,000 this month?",
  "Am I on track financially?",
  "What's my biggest financial risk?",
];

function Chat({ transactions, budgets }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I've analyzed your spending data. Ask me anything about your finances — I'll give you specific, actionable advice based on your actual numbers." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("claude_api_key") || "");
  const [showKey, setShowKey] = useState(!localStorage.getItem("claude_api_key"));
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const updatedMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    const key = apiKey || import.meta.env?.VITE_CLAUDE_API_KEY;
    if (!key) {
      setMessages(prev => [...prev, { role: "assistant", content: "Please enter your Claude API key above to enable AI responses." }]);
      setLoading(false);
      return;
    }

    try {
      const systemPrompt = buildSystemPrompt(transactions, budgets);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}. Check your API key.` }]);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    localStorage.setItem("claude_api_key", apiKey);
    setShowKey(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      {showKey && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Claude API key</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            Get your key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#378ADD" }}>console.anthropic.com</a>.
            Stored locally, never sent anywhere except Anthropic.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveKey()}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
            />
            <button onClick={saveKey} style={btnStyle("#1D9E75")}>Save</button>
          </div>
        </div>
      )}

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, flex: 1, minHeight: 360, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12, maxHeight: 380 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: m.role === "user" ? "#1D9E75" : "var(--hover)",
                color: m.role === "user" ? "#fff" : "var(--text)",
                fontSize: 13, lineHeight: 1.6,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: "12px 12px 12px 4px", background: "var(--hover)", fontSize: 13, color: "var(--muted)" }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 20,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--muted)", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.target.style.background = "var(--hover)"; e.target.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "var(--muted)"; }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your spending..."
            disabled={loading}
            style={{ flex: 1, padding: "9px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={btnStyle("#1D9E75")}>
            Send
          </button>
          {!showKey && (
            <button onClick={() => setShowKey(true)} style={btnStyle("#888", true)} title="Change API key">Key</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Budget({ budgets, setBudgets, transactions }) {
  const catTotals = useMemo(() => {
    const t = {};
    transactions.filter(tx => tx.type === "expense").forEach(tx => {
      t[tx.category] = (t[tx.category] || 0) + Math.abs(tx.amount);
    });
    return t;
  }, [transactions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
        Set monthly limits per category. Bars turn red when you exceed your budget.
      </div>
      {Object.entries(budgets).map(([cat, limit]) => {
        const spent = catTotals[cat] || 0;
        const pct = Math.min((spent / limit) * 100, 100);
        const over = spent > limit;
        return (
          <div key={cat} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[cat] || "#888" }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{cat}</span>
                {over && <span style={{ fontSize: 11, color: "#E24B4A", background: "#E24B4A22", padding: "2px 7px", borderRadius: 20 }}>Over budget</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>₹{Math.round(spent).toLocaleString("en-IN")} spent  /  limit:</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>₹</span>
                <input
                  type="number"
                  value={limit}
                  onChange={e => setBudgets(prev => ({ ...prev, [cat]: parseInt(e.target.value) || 0 }))}
                  style={{ width: 80, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
                />
              </div>
            </div>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`, borderRadius: 4,
                background: over ? "#E24B4A" : pct > 80 ? "#BA7517" : CATEGORY_COLORS[cat] || "#1D9E75",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BUTTON STYLE HELPER ────────────────────────────────────────────────────
function btnStyle(color, ghost = false) {
  return {
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: "pointer", border: ghost ? "1px solid var(--border)" : "none",
    background: ghost ? "transparent" : color, color: ghost ? "var(--muted)" : "#fff",
    transition: "opacity 0.15s",
  };
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
const TABS = ["Dashboard", "Transactions", "AI Advisor", "Budgets"];

export default function App() {
  const { transactions, addTransactions, resetToSample } = useTransactions();
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_budgets");
      return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
    } catch { return DEFAULT_BUDGETS; }
  });
  const [tab, setTab] = useState("Dashboard");

  useEffect(() => {
    localStorage.setItem("fin_budgets", JSON.stringify(budgets));
  }, [budgets]);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      "--bg": "#0f1117", "--card": "#181c25", "--border": "#2a2f3d",
      "--text": "#eef0f6", "--muted": "#7c8299", "--hover": "#1e2333",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, button { font-family: inherit; outline: none; }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>Finance Advisor</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {transactions.length} transactions · March 2025
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 4 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: tab === t ? "#1D9E75" : "transparent",
                color: tab === t ? "#fff" : "var(--muted)",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {tab === "Dashboard"     && <Dashboard transactions={transactions} budgets={budgets} />}
        {tab === "Transactions"  && <Transactions transactions={transactions} onImport={addTransactions} onReset={resetToSample} />}
        {tab === "AI Advisor"    && <Chat transactions={transactions} budgets={budgets} />}
        {tab === "Budgets"       && <Budget budgets={budgets} setBudgets={setBudgets} transactions={transactions} />}
      </div>
    </div>
  );
}