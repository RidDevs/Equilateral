import { useState } from "react";
import { useTransactions, useBudgets } from "./hooks";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Chat from "./pages/Chat";
import Budgets from "./pages/Budget";
import Expenses from "./pages/Expenses";

export default function App() {
  const { transactions, addTransactions, resetToSample } = useTransactions();
  const { budgets, setBudgets } = useBudgets();
  const [tab, setTab] = useState("Dashboard");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        // CSS variable overrides for dark theme
        "--bg": "#0f1117",
        "--card": "#181c25",
        "--border": "#2a2f3d",
        "--text": "#eef0f6",
        "--muted": "#7c8299",
        "--hover": "#1e2333",
      }}
    >
      {/* Global styles */}
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
        {/* ── Navigation ── */}
        <Navbar tab={tab} setTab={setTab} txCount={transactions.length} />

        {/* ── Page routing ── */}
        {tab === "Dashboard" && (
          <Dashboard transactions={transactions} budgets={budgets} />
        )}
        {tab === "Transactions" && (
          <Transactions
            transactions={transactions}
            onImport={addTransactions}
            onReset={resetToSample}
          />
        )}
        {tab === "AI Advisor" && (
          <Chat transactions={transactions} budgets={budgets} />
        )}
        {tab === "Budgets" && (
          <Budgets
            budgets={budgets}
            setBudgets={setBudgets}
            transactions={transactions}
          />
        )}
        {tab === "Add expense/income" && (
          <Expenses onAdd={addTransactions} />
        )}
      </div>
    </div>
  );
}
