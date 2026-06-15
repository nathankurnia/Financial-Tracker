"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  type: z.enum(["income", "expense"], { message: "Invalid category type" }),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  budget_limit: z.number().int().nullable(),
});

export async function createCategory(formData: FormData) {
  const budgetRaw = formData.get("budget_limit") as string;
  const rawData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    color: formData.get("color") as string | null,
    icon: formData.get("icon") as string | null,
    budget_limit: budgetRaw ? parseInt(budgetRaw, 10) : null,
  };

  const result = categorySchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated" };
  }

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: result.data.name,
    type: result.data.type,
    color: result.data.color,
    icon: result.data.icon,
    budget_limit: result.data.budget_limit,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const budgetRaw = formData.get("budget_limit") as string;
  const rawData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    color: formData.get("color") as string | null,
    icon: formData.get("icon") as string | null,
    budget_limit: budgetRaw ? parseInt(budgetRaw, 10) : null,
  };

  const result = categorySchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated" };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: result.data.name,
      type: result.data.type,
      color: result.data.color,
      icon: result.data.icon,
      budget_limit: result.data.budget_limit,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated" };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/categories");
  return { success: true };
}
