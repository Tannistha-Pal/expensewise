import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory, DEFAULT_BUDGETS } from "@/types";

export interface BudgetPreferences {
  budgetPercent: number;
  savingsPercent: number;
}

interface AppState {
  transactions: Transaction[];
  currency: string;
  budgets: BudgetCategory[];
  budgetPreferences: BudgetPreferences;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCurrency: (code: string) => void;
  updateBudget: (category: string, limit: number) => void;
  updateBudgetPreferences: (prefs: BudgetPreferences) => void;
  scaleBudgetsToPercent: (newBudgetPercent: number) => void;
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
  const [budgetPreferences, setBudgetPreferences] = useState<BudgetPreferences>(() =>
    loadFromStorage("ew_budget_preferences", { budgetPercent: 60, savingsPercent: 40 })
  );

  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = loadFromStorage<BudgetCategory[]>("ew_budgets", DEFAULT_BUDGETS);

    // 🔒 Enforce Bills ≥ 30% on load
    const total = saved.reduce((sum, b) => sum + b.limit, 0);
    const bills = saved.find((b) => b.category.toLowerCase() === "bills");
    const others = saved.filter((b) => b.category.toLowerCase() !== "bills");

    const minBills = total * 0.3;
    const billsLimit = bills ? Math.max(bills.limit, minBills) : minBills;
    const remaining = Math.max(total - billsLimit, 0);
    const otherTotal = others.reduce((sum, b) => sum + b.limit, 0);

    return saved.map((b) => {
      if (b.category.toLowerCase() === "bills") {
        return { ...b, limit: Math.round(billsLimit) };
      }
      const ratio = otherTotal > 0 ? b.limit / otherTotal : 0;
      return { ...b, limit: Math.round(remaining * ratio) };
    });
  });

  useEffect(() => {
    localStorage.setItem("ew_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("ew_currency", JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("ew_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("ew_budget_preferences", JSON.stringify(budgetPreferences));
  }, [budgetPreferences]);

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

  const updateBudgetPreferences = useCallback((prefs: BudgetPreferences) => {
    setBudgetPreferences(prefs);
  }, []);

  const scaleBudgetsToPercent = useCallback(
    (newBudgetPercent: number) => {
      setBudgets((prev) => {
        const oldPercent = budgetPreferences.budgetPercent || 100;
        const scaleFactor = newBudgetPercent / oldPercent;

        const totalOld = prev.reduce((sum, b) => sum + b.limit, 0);
        const newTotal = totalOld * scaleFactor;

        const bills = prev.find((b) => b.category.toLowerCase() === "bills");
        const others = prev.filter((b) => b.category.toLowerCase() !== "bills");

        const minBills = newTotal * 0.3;
        const newBills = bills ? Math.max(bills.limit * scaleFactor, minBills) : minBills;

        const remaining = Math.max(newTotal - newBills, 0);
        const othersOldTotal = others.reduce((sum, b) => sum + b.limit, 0);

        return prev.map((b) => {
          if (b.category.toLowerCase() === "bills") {
            return { ...b, limit: Math.round(newBills) };
          }
          const ratio = othersOldTotal > 0 ? b.limit / othersOldTotal : 0;
          return { ...b, limit: Math.round(remaining * ratio) };
        });
      });
    },
    [budgetPreferences.budgetPercent]
  );

  return (
    <AppContext.Provider
      value={{
        transactions,
        currency,
        budgets,
        budgetPreferences,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setCurrency,
        updateBudget,
        updateBudgetPreferences,
        scaleBudgetsToPercent,
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
