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

// ─── useGoals ─────────────────────────────────────────────────────────────────
export function useGoals() {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_goals");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("fin_goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = useCallback((goal) => {
    const newGoal = {
      id: Date.now(),
      name: goal.name,
      targetAmount: Number(goal.targetAmount) || 0,
      deadline: goal.deadline,
      currentSaved: Number(goal.currentSaved) || 0,
    };
    setGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateGoal = useCallback((id, updates) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      )
    );
  }, []);

  const addSavingsToGoal = useCallback((id, amount) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, currentSaved: (g.currentSaved || 0) + Number(amount) }
          : g
      )
    );
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, addGoal, updateGoal, addSavingsToGoal, deleteGoal };
}
