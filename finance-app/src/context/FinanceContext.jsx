import { createContext, useContext } from "react";
import { useTransactions, useBudgets, useGoals } from "../hooks";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  // Initialize hooks inside the provider
  const transactionsData = useTransactions();
  const budgetsData = useBudgets(transactionsData.transactions);
  const goalsData = useGoals();

  // Combine data logically into a single state
  const value = {
    ...transactionsData,
    ...budgetsData,
    ...goalsData,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

// Custom hook helper to prevent missing Context imports in child files
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
