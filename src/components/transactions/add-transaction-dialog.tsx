"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createTransaction } from "@/app/(app)/dashboard/transactions/actions";
import { parseCurrencyInput, cn } from "@/lib/utils";
import type { Account, Category } from "@/types/database";

const schema = z.object({
  account_id: z.string().min(1, "Account is required"),
  category_id: z.string().nullable(),
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["income", "expense"]),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof schema>;

interface AddTransactionDialogProps {
  accounts: Account[];
  categories: Category[];
}

export function AddTransactionDialog({
  accounts,
  categories,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      account_id: accounts[0]?.id ?? "",
      category_id: null,
      amount: "",
      type: "expense",
      description: "",
      transaction_date: today,
    },
  });

  const selectedType = watch("type");
  const selectedAccountId = watch("account_id");
  const selectedCategoryId = watch("category_id");

  //Find current account to determine currency
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const currency = selectedAccount?.currency ?? "EUR";

  // Filter categories by selected type
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = async (data: FormData) => {
    if (!selectedAccount) {
      setServerError("Please select an account");
      return;
    }

    setServerError(null);
    setIsPending(true);

    const amountInSmallestUnit = parseCurrencyInput(data.amount, currency);

    const formData = new FormData();
    formData.append("account_id", data.account_id);
    if (data.category_id) formData.append("category_id", data.category_id);
    formData.append("amount", String(amountInSmallestUnit));
    formData.append("type", data.type);
    formData.append("currency", currency);
    if (data.description) formData.append("description", data.description);
    formData.append("transaction_date", data.transaction_date);

    const result = await createTransaction(formData);
    setIsPending(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    toast.success("Transaction added successfully");
    reset({
      account_id: data.account_id, // keep account for fast multi-entry
      category_id: null,
      amount: "",
      type: data.type,
      description: "",
      transaction_date: today,
    });
    setOpen(false);
  };

  // Disable button if no accounts exist
  if (accounts.length === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Button disabled className="pointer-events-none">
              + Add Transaction
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>You need to create an account first</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Transaction</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Record an income or expense from one of your accounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-md bg-muted">
            <button
              type="button"
              onClick={() =>
                setValue("type", "expense", {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className={cn(
                "py-2 rounded text-sm font-medium transition-colors",
                selectedType === "expense"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() =>
                setValue("type", "income", {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className={cn(
                "py-2 rounded text-sm font-medium transition-colors",
                selectedType === "income"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Income
            </button>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="account">Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={(value) =>
                setValue("account_id", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount ({currency})</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder={currency === "EUR" ? "0,00" : "0"}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">
              Category{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Select
              value={selectedCategoryId ?? "none"}
              onValueChange={(value) =>
                setValue("category_id", value === "none" ? null : value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon ?? "📌"} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No {selectedType} categories yet. You can add one from the
                Categories page.
              </p>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              max={today}
              {...register("transaction_date")}
            />
            {errors.transaction_date && (
              <p className="text-sm text-destructive">
                {errors.transaction_date.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g. Lunch at Mensa, Monthly rent"
              {...register("description")}
            />
          </div>

          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
