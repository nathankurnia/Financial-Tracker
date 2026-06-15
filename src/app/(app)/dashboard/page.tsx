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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: accountCount } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold"> Dashboard</h2>
        <LogoutButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user!.email}</CardTitle>
          <CardDescription>
            Your personal finance tracker for life in Europe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            You have <span className="font-semibold">{accountCount ?? 0}</span>{" "}
            account
            {accountCount === 1 ? "" : "s"} configured.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/transactions">View Transactions</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/accounts">Manage Accounts</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/categories">Manage Categories</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
