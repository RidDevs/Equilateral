import { useState } from "react";
import { useFinance } from "../context/FinanceContext";

export default function Expenses() {
  const { addTransactions: onAdd } = useFinance();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("expense");
  const [successMsg, setSuccessMsg] = useState("");

  const expenseCategories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health"];
  const incomeCategories = ["salary", "credit", "freelance", "payment received", "cashback"];

  const currentCategories = type === "expense" ? expenseCategories : incomeCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx = {
      id: Date.now(),
      date,
      description,
      amount: type === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      type,
      category,
    };

    onAdd([newTx]);
    
    // Reset form
    setDescription("");
    setAmount("");
    setSuccessMsg("Transaction added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "24px",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>Add New Transaction</h2>
        
        {successMsg && (
          <div style={{
            background: "#1D9E7522",
            color: "#1D9E75",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--muted)" }}>Type</label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value;
                setType(newType);
                setCategory(newType === "expense" ? expenseCategories[0] : incomeCategories[0]);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--muted)" }}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery shopping"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--muted)" }}>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--muted)" }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
              }}
            >
              {currentCategories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--muted)" }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              ...btnStyle("#1D9E75"),
              marginTop: "8px",
              width: "100%",
              padding: "12px",
              fontSize: "15px"
            }}
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
