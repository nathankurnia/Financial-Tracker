import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { Car } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: accounts } = await supabase.from("accounts").select("*");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold"> Dashboard</h2>
        <LogoutButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selamat datang!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">User ID:</span>{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">{user!.id}</code>
          </p>
          <p>
            <span className="text-muted-foreground">Email: {user!.email} </span>
          </p>
          <p>
            <span className="text-muted-foreground">Accounts:</span>{" "}
            {accounts?.length ?? 0} ditemukan{" "}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
