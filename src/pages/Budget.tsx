import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useCurrency } from "@/hooks/useCurrency";
import { SummaryCard } from "@/components/SummaryCard";
import { PiggyBank, TrendingDown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function BudgetPage() {
  const { transactions, budgets, updateBudget } = useAppContext();
  const { formatAmount } = useCurrency();
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");

  const spending = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = Object.values(spending).reduce((s, v) => s + v, 0);

  const handleEditSave = () => {
    if (editCategory && editLimit) {
      updateBudget(editCategory, parseFloat(editLimit));
      setEditCategory(null);
      setEditLimit("");
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Budget</h2>
        <p className="text-muted-foreground">Track your spending limits</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Budget" value={formatAmount(totalBudget)} icon={Target} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <SummaryCard title="Total Spent" value={formatAmount(totalSpent)} icon={TrendingDown} iconBg="bg-red-100" iconColor="text-red-600" />
        <SummaryCard title="Remaining" value={formatAmount(Math.max(0, totalBudget - totalSpent))} icon={PiggyBank} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
      </div>

      {/* Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const spent = spending[b.category] || 0;
          const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;

          return (
            <Card key={b.category} className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{b.category}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditCategory(b.category); setEditLimit(b.limit.toString()); }}
                    className="text-xs text-muted-foreground"
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatAmount(spent)} / {formatAmount(b.limit)}
                    </span>
                    <span className={cn(
                      "font-medium",
                      pct >= 90 ? "text-red-500" : pct >= 70 ? "text-yellow-600" : "text-emerald-600"
                    )}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", getProgressColor(pct))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCategory} onOpenChange={(o) => !o && setEditCategory(null)}>
        <DialogContent className="sm:max-w-sm bg-background">
          <DialogHeader>
            <DialogTitle>Edit Budget — {editCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="budgetLimit">Monthly Limit</Label>
            <Input
              id="budgetLimit"
              type="number"
              min="0"
              step="100"
              value={editLimit}
              onChange={(e) => setEditLimit(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
