import { createContext, useContext } from "react";
import { useTransactions, useBudgets, useGoals, useChat } from "../hooks";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const transactionsData = useTransactions();
  const budgetsData = useBudgets(transactionsData.transactions);
  const goalsData = useGoals();
  const chatData = useChat();

  const value = {
    ...transactionsData,
    ...budgetsData,
    ...goalsData,
    ...chatData,
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
