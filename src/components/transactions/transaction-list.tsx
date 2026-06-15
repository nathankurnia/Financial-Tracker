"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionRow } from "@/components/transactions/transaction-row";
import type { Account, Category, Transaction } from "@/types/database";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

type SortBy = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export function TransactionList({
  transactions,
  accounts,
  categories,
}: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );

  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");

  // Build lookup maps for O(1) access
  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const filtered = useMemo(()=> {
    return transactions.filter((txn) => {
      //Filter by type
      if(filterType !== "all" && txn.type !== filterType) return false;

      //Filter by account
      if(filterAccount !== "all" && txn.account_id !== filterAccount)
        return false;

      //Filter by category
      if(filterCategory !== "all") {
        if(filterCategory === "none" && txn.category_id !== null) return false;
        if(filterCategory !== "none" && txn.category_id !== filterCategory)
          return false;
      }

      if(search){
        const desc = txn.description?.toLowerCase() ?? "";
        const categoryName = 
          (txn.category_id && categoryMap.get(txn.category_id)?.name) ?? "";
        const accountName = accountMap.get(txn.account_id)?.name ?? "";
        const haystack = `${desc} ${categoryName} ${accountName}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }

      return true;
    });
  }, [
    transactions,
    filterType,
    filterAccount,
    filterCategory,
    search,
    accountMap,
    categoryMap,
  ]);

  // Apply sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "date_desc":
        return arr.sort((a, b) =>
          b.transaction_date.localeCompare(a.transaction_date)
        );
      case "date_asc":
        return arr.sort((a, b) =>
          a.transaction_date.localeCompare(b.transaction_date)
        );
      case "amount_desc":
        return arr.sort((a, b) => b.amount - a.amount);
      case "amount_asc":
        return arr.sort((a, b) => a.amount - b.amount);
    }
  }, [filtered, sortBy]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    if(sortBy !== "date_desc" && sortBy !== "date_asc") return null;

    const groups = new Map<string, Transaction[]>();
    for (const txn of sorted) {
      const date = txn.transaction_date;
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(txn);
    }
    return groups;
  }, [sorted, sortBy]);

  const hasActiveFilters =
    search !== "" ||
    filterType !== "all" ||
    filterAccount !== "all" ||
    filterCategory !== "all";

    const resetFilters = () => {
      setSearch("");
      setFilterType("all");
      setFilterAccount("all");
      setFilterCategory("all");
    };

  return (
  <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <Card className="p-4 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search descriptions, categories, accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as typeof filterType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income only</SelectItem>
              <SelectItem value="expense">Expense only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="none">Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon ?? "📌"} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest first</SelectItem>
              <SelectItem value="date_asc">Oldest first</SelectItem>
              <SelectItem value="amount_desc">Highest amount</SelectItem>
              <SelectItem value="amount_asc">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              Showing {sorted.length} of {transactions.length} transactions
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7"
            >
              <X className="mr-1 h-3 w-3" />
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {/* Empty filter result */}
      {sorted.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">
              No transactions match your filters.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </Card>
      )}

      {/* List with date grouping (only for date sort) */}
      {groupedByDate &&
        Array.from(groupedByDate.entries()).map(([date, txns]) => (
          <section key={date} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground py-1">
              {formatGroupDate(date)}
            </h3>
            <Card>
              <div className="divide-y">
                {txns.map((txn) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    account={accountMap.get(txn.account_id)}
                    category={
                      txn.category_id
                        ? categoryMap.get(txn.category_id)
                        : undefined
                    }
                    accounts={accounts}
                    categories={categories}
                  />
                ))}
              </div>
            </Card>
          </section>
        ))}

      {/* Flat list (for amount sort) */}
      {!groupedByDate && sorted.length > 0 && (
        <Card>
          <div className="divide-y">
            {sorted.map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                account={accountMap.get(txn.account_id)}
                category={
                  txn.category_id ? categoryMap.get(txn.category_id) : undefined
                }
                accounts={accounts}
                categories={categories}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}