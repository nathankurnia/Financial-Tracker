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
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="text-6xl">📂</div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">No categories yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Categories help you organize transactions. Create some for
                expenses like Mensa, Groceries, BVG, and for income like BAföG
                or Scholarship.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click &quot;+ Add Category&quot; above to begin
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
