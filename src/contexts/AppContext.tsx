import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory, DEFAULT_BUDGETS } from "@/types";

interface AppState {
  transactions: Transaction[];
  currency: string;
  budgets: BudgetCategory[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCurrency: (code: string) => void;
  updateBudget: (category: string, limit: number) => void;
}

const AppContext = createContext<AppState | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage("ew_transactions", [])
  );
  const [currency, setCurrencyState] = useState<string>(() =>
    loadFromStorage("ew_currency", "INR")
  );
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() =>
    loadFromStorage("ew_budgets", DEFAULT_BUDGETS)
  );

  useEffect(() => {
    localStorage.setItem("ew_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("ew_currency", JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("ew_budgets", JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...t, id: crypto.randomUUID() };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? t : tx)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
  }, []);

  const updateBudget = useCallback((category: string, limit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit } : b))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        transactions,
        currency,
        budgets,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setCurrency,
        updateBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
