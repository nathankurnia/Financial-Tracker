import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";
import type { Account, Category, Transaction } from "@/types/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default async function TransactionsPage() {
  const supabase = await createClient();

  // Fetch all needed data in parallel
  const [accountsResult, categoriesResult, transactionsResult] =
    await Promise.all([
      supabase.from("accounts").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (
    accountsResult.error ||
    categoriesResult.error ||
    transactionsResult.error
  ) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load data. Please try refreshing the page.
      </div>
    );
  }

  const accounts = (accountsResult.data ?? []) as Account[];
  const categories = (categoriesResult.data ?? []) as Category[];
  const transactions = (transactionsResult.data ?? []) as Transaction[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Track your income and expenses across all accounts.
          </p>
        </div>
        <AddTransactionDialog accounts={accounts} categories={categories} />
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-6xl">🏦</div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">No accounts yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                You need at least one account to start tracking transactions.
                Add a bank account, digital wallet, or cash account first.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/accounts">Go to Accounts</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && transactions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-6xl">💰</div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Track your first transaction</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start logging your income and expenses to see where your money
                goes. You can add transactions in any currency you&apos;ve set
                up.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click &quot;+ Add Transaction&quot; above to begin
            </p>
          </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          categories={categories}
        />
      )}
    </div>
  );
}
