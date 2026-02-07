import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType, Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction | null;
}

export function AddTransactionModal({ open, onOpenChange, editTransaction }: Props) {
  const { addTransaction, updateTransaction } = useAppContext();
  const isEditing = !!editTransaction;

  const [type, setType] = useState<TransactionType>(editTransaction?.type || "expense");
  const [description, setDescription] = useState(editTransaction?.description || "");
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || "");
  const [category, setCategory] = useState(editTransaction?.category || "");
  const [date, setDate] = useState<Date | undefined>(
    editTransaction ? new Date(editTransaction.date) : new Date()
  );

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const resetForm = () => {
    setType("expense");
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !category || !date) return;

    const txData = {
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: date.toISOString(),
    };

    if (isEditing && editTransaction) {
      updateTransaction({ ...txData, id: editTransaction.id });
    } else {
      addTransaction(txData);
    }

    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategory(""); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                type === "expense"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategory(""); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                type === "income"
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Income
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full",
              type === "income"
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : ""
            )}
          >
            {isEditing
              ? "Save Changes"
              : type === "expense"
              ? "Add Expense"
              : "Add Income"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
