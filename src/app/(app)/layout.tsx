import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MainNav } from "@/components/layout/main-nav";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4">
          {/* Top row: brand + user actions */}
          <div className="flex items-center justify-between py-3">
            <Link href="/dashboard" className="font-semibold text-lg">
              Finance Tracker
            </Link>
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-sm text-muted-foreground">
                {user.email}
              </p>
              <LogoutButton />
            </div>
          </div>

          {/* Bottom row: navigation */}
          <div className="pb-2">
            <MainNav />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
