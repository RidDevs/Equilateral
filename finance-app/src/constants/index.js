import { useState, useEffect, useCallback } from "react";
import { SAMPLE_TRANSACTIONS, DEFAULT_BUDGETS } from "../constants";

// ─── useTransactions ─────────────────────────────────────────────────────────
export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_transactions");
      return saved ? JSON.parse(saved) : SAMPLE_TRANSACTIONS;
    } catch {
      return SAMPLE_TRANSACTIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem("fin_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransactions = useCallback((newTxns) => {
    setTransactions((prev) => [...prev, ...newTxns]);
  }, []);

  const resetToSample = useCallback(() => {
    setTransactions(SAMPLE_TRANSACTIONS);
  }, []);

  return { transactions, addTransactions, resetToSample };
}

// ─── useBudgets ───────────────────────────────────────────────────────────────
export function useBudgets() {
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_budgets");
      return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  });

  useEffect(() => {
    localStorage.setItem("fin_budgets", JSON.stringify(budgets));
  }, [budgets]);

  return { budgets, setBudgets };
}
