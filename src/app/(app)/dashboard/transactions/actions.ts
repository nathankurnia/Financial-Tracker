"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transactionSchema = z.object({
  account_id: z.string().uuid("Invalid account"),
  category_id: z.string().uuid().nullable(),
  amount: z.number().positive("Amount must be greater than zero"),
  type: z.enum(["income", "expense"]),
  currency: z.enum(["EUR", "IDR"]),
  description: z.string().max(200, "Maximum 200 characters").nullable(),
  transaction_date: z.string().min(1, "Date is required"),
});

export async function createTransaction(formData: FormData) {
  const rawData = {
    account_id: formData.get("account_id") as string,
    category_id: (formData.get("category_id") as string) || null,
    amount: parseInt(formData.get("amount") as string, 10) || 0,
    type: formData.get("type") as string,
    currency: formData.get("currency") as string,
    description: (formData.get("description") as string) || null,
    transaction_date: formData.get("transaction_date") as string,
  };

  const result = transactionSchema.safeParse(rawData);
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

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    account_id: result.data.account_id,
    category_id: result.data.category_id,
    amount: result.data.amount,
    type: result.data.type,
    currency: result.data.currency,
    description: result.data.description,
    transaction_date: result.data.transaction_date,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTransaction(id: string, formData: FormData) {
  const rawData = {
    account_id: formData.get("account_id") as string,
    category_id: (formData.get("category_id") as string) || null,
    amount: parseInt(formData.get("amount") as string, 10) || 0,
    type: formData.get("type") as string,
    currency: formData.get("currency") as string,
    description: (formData.get("description") as string) || null,
    transaction_date: formData.get("transaction_date") as string,
  };

  const result = transactionSchema.safeParse(rawData);
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
    .from("transactions")
    .update({
      account_id: result.data.account_id,
      category_id: result.data.category_id,
      amount: result.data.amount,
      type: result.data.type,
      currency: result.data.currency,
      description: result.data.description,
      transaction_date: result.data.transaction_date,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}
