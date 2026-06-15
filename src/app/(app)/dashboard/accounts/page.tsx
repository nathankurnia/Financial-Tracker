import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Account, Currency } from "@/types/database";
import { AccountCard } from "@/components/accounts/account-card";

const ACCOUNT_TYPE_LABELS: Record<Account["type"], string> = {
  bank: "Bank",
  ewallet: "Digital Wallet",
  cash: "Cash",
  other: "Other",
};

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load accounts: {error.message}
      </div>
    );
  }

  //Group accounts by currency for cleaner display
  const accountsByCurrency = (accounts ?? []).reduce<
    Record<Currency, Account[]>
  >(
    (acc, account) => {
      const curr = account.currency as Currency;
      if (!acc[curr]) acc[curr] = [];
      acc[curr].push(account as Account);
      return acc;
    },
    { EUR: [], IDR: [] },
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Manage your bank accounts, wallets, and other funds.
          </p>
        </div>
        <AddAccountDialog />
      </div>
      {(!accounts || accounts.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-6xl">🏦</div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">No accounts yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add your bank accounts, digital wallets, or cash to start
                managing your finances across Indonesia and Europe.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click &quot;+ Add Account&quot; above to begin
            </p>
          </CardContent>
        </Card>
      )}

      {(["EUR", "IDR"] as Currency[]).map((currency) => {
        const list = accountsByCurrency[currency];
        if (list.length === 0) return null;

        const totalBalance = list.reduce((sum, acc) => sum + acc.balance, 0);

        return (
          <section key={currency} className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium">{currency} Accounts</h3>
              <p className="text-sm">
                <span className="text-muted-foreground"> Total: </span>
                <span className="font-semibold">
                  {formatCurrency(totalBalance, currency)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
