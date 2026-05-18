import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("accounts").select("*");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-medium">Finance Tracker</h1>
      <Button>Tombol Tes</Button>
      <div className="rounded-lg border p-4 text-sm">
        <p className="font-medium">Test Koneksi Supabase:</p>
        <pre className="mt-2 text-xs">
          {error
            ? `❌ Error: ${error.message}`
            : `✅ Connected. Accounts found: ${data?.length ?? 0}`}
        </pre>
      </div>
    </main>
  );
}
