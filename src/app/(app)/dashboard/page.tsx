import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Account, Currency, Transaction } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [accountsResult, transactionsResult] = await Promise.all([
    supabase.from("accounts").select("*"),
    supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const accounts = (accountsResult.data ?? []) as Account[];
  const recentTransactions = (transactionsResult.data ?? []) as Transaction[];

  const totalsByCurrency = accounts.reduce<Record<Currency, number>>(
    (acc, account) => {
      acc[account.currency] = (acc[account.currency] ?? 0) + account.balance;
      return acc;
    },
    { EUR: 0, IDR: 0 },
  );

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const thisMonthExpensesResult = await supabase
    .from("transactions")
    .select("amount, currency")
    .eq("type", "expense")
    .gte("transaction_date", firstDayOfMonth);

  const monthlyExpenses = (thisMonthExpensesResult.data ?? []).reduce<
    Record<Currency, number>
  >(
    (acc, txn) => {
      const curr = txn.currency as Currency;
      acc[curr] = (acc[curr] ?? 0) + txn.amount;
      return acc;
    },
    { EUR: 0, IDR: 0 },
  );
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Welcome back, {user!.email?.split("@")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your finances.
        </p>
      </div>

      {/* Total Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["EUR", "IDR"] as Currency[]).map((currency) => {
          const balance = totalsByCurrency[currency];
          const monthSpent = monthlyExpenses[currency];
          const hasAccountInCurrency = accounts.some(
            (a) => a.currency === currency,
          );

          if (!hasAccountInCurrency) return null;

          return (
            <Card key={currency}>
              <CardHeader>
                <CardDescription>Total Balance · {currency}</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(balance, currency)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {monthName} expenses:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(monthSpent, currency)}
                  </span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state if no accounts */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any accounts yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Visit the Accounts page to add your first one.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentTransactions.map((txn) => {
              const account = accounts.find((a) => a.id === txn.account_id);
              const isIncome = txn.type === "income";
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex flex-col min-w-0">
                    <p className="font-medium truncate">
                      {txn.description || "Transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {account?.name ?? "Unknown"} ·{" "}
                      {new Date(txn.transaction_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <p
                    className={
                      isIncome ? "font-medium text-green-600" : "font-medium"
                    }
                  >
                    {isIncome ? "+" : "−"}
                    {formatCurrency(txn.amount, txn.currency)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
