"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/components/transactions/transaction-row";
import type { Account, Category, Transaction } from "@/types/database";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

export function TransactionList({
  transactions,
  accounts,
  categories,
}: TransactionListProps) {
  // Build lookup maps for O(1) access
  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const txn of transactions) {
      const date = txn.transaction_date;
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(txn);
    }
    return groups;
  }, [transactions]);

  return (
    <div className="flex flex-col gap-4">
      {Array.from(groupedByDate.entries()).map(([date, txns]) => (
        <section key={date} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-1">
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
