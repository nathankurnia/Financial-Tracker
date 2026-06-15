import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";
import type { Account, Category, Transaction } from "@/types/database";

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
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">
              You need at least one account to start tracking transactions.
            </p>
            <p className="text-sm text-muted-foreground">
              Add an account first from the Accounts page.
            </p>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && transactions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any transactions yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Click &quot;Add Transaction&quot; above to record your first one.
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
