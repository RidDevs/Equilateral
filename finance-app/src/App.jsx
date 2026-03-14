import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Chat from "./pages/Chat";
import Budgets from "./pages/Budget";
import Expenses from "./pages/Expenses";

import BillReminders from "./pages/BillReminders";


export default function App() {
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
        @media (max-width: 768px) {
          input, button { font-size: 16px !important; }
          .goal-form { gridTemplateColumns: 1fr !important; }
          .card-section { padding: 16px !important; }
        }
        @media (min-width: 769px) {
          .charts-grid { gridTemplateColumns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* ── Navigation ── */}
        <Navbar tab={tab} setTab={setTab} />

        {/* ── Page routing ── */}
        {tab === "Dashboard" && <Dashboard />}
        {tab === "Transactions" && <Transactions />}
        {tab === "AI Advisor" && <Chat />}
        {tab === "Budgets" && <Budgets />}
        {tab === "Bill Reminders" && <BillReminders />}
        {tab === "Add expense/income" && <Expenses />}
      </div>
    </div>
  );
}
