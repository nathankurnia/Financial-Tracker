import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { CategoryCard } from "@/components/categories/category-card";
import type { Category } from "@/types/database";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load categories: {error.message}
      </div>
    );
  }

  const expenseCategories = (categories ?? []).filter(
    (c): c is Category => c.type === "expense",
  );
  const incomeCategories = (categories ?? []).filter(
    (c): c is Category => c.type === "income",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your income and expense categories.
          </p>
        </div>
        <AddCategoryDialog />
      </div>

      {(!categories || categories.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have any categories yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Create categories to group your transactions.
            </p>
          </CardContent>
        </Card>
      )}

      {expenseCategories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-medium border-b pb-2">
            Expense Categories ({expenseCategories.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenseCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {incomeCategories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-medium border-b pb-2">
            Income Categories ({incomeCategories.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomeCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
