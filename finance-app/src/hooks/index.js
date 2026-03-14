import { useState, useEffect, useCallback } from "react";
import { SAMPLE_TRANSACTIONS, getDefaultBudgets } from "../constants";

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
export function useBudgets(transactions = []) {
  // Compute total income from transactions
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_budgets");
      return saved ? JSON.parse(saved) : getDefaultBudgets(totalIncome);
    } catch {
      return getDefaultBudgets(totalIncome);
    }
  });

  useEffect(() => {
    localStorage.setItem("fin_budgets", JSON.stringify(budgets));
  }, [budgets]);

  return { budgets, setBudgets, totalIncome };
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

// ─── useReminders ─────────────────────────────────────────────────────────────
export function useReminders() {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_reminders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("fin_reminders", JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = useCallback((reminder) => {
    const newReminder = {
      id: Date.now(),
      name: reminder.name,
      dueDate: reminder.dueDate,
      amount: Number(reminder.amount) || 0,
      category: reminder.category || "Bills",
      frequency: reminder.frequency || "one-time",
      isActive: true,
      isPaid: false,
      paidDate: null,
    };
    setReminders((prev) => [...prev, newReminder]);
  }, []);

  const updateReminder = useCallback((id, updates) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    );
  }, []);

  const deleteReminder = useCallback((id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleReminder = useCallback((id) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      )
    );
  }, []);

  const markAsPaid = useCallback((id) => {
    setReminders((prev) => {
      const updatedReminders = prev.map((r) => {
        if (r.id === id) {
          const paidReminder = {
            ...r,
            isPaid: true,
            paidDate: new Date().toISOString().slice(0, 10),
          };

          // If recurring, create a new reminder for next occurrence
          if (r.frequency === "monthly" || r.frequency === "yearly") {
            const currentDueDate = new Date(r.dueDate);
            let nextDueDate;

            if (r.frequency === "monthly") {
              nextDueDate = new Date(currentDueDate);
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            } else if (r.frequency === "yearly") {
              nextDueDate = new Date(currentDueDate);
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            }

            const nextReminderString = nextDueDate.toISOString().slice(0, 10);

            // Add new reminder to the list
            prev.push({
              id: Date.now() + Math.random(),
              name: r.name,
              dueDate: nextReminderString,
              amount: r.amount,
              category: r.category,
              frequency: r.frequency,
              isActive: true,
              isPaid: false,
              paidDate: null,
            });
          }

          return paidReminder;
        }
        return r;
      });

      return updatedReminders;
    });
  }, []);

  const markAsUnpaid = useCallback((id) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isPaid: false, paidDate: null } : r
      )
    );
  }, []);

  return { reminders, addReminder, updateReminder, deleteReminder, toggleReminder, markAsPaid, markAsUnpaid };
}
