"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const accountSchema = z.object({
  name: z
    .string()
    .min(1, "Account name is required")
    .max(50, "Account name must be less than 50 characters"),
  type: z.enum(["bank", "ewallet", "cash", "other"], {
    message: "Invalid account type",
  }),
  currency: z.enum(["EUR", "IDR"], {
    message: "Invalid currency",
  }),
  balance: z.number().int().min(0, "Balance cannot be negative"),
});

export async function createAccount(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    currency: formData.get("currency") as string,
    balance: parseInt(formData.get("balance") as string, 10) || 0,
  };

  const result = accountSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: result.data.name,
    type: result.data.type,
    currency: result.data.currency,
    balance: result.data.balance,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  return { success: true };
}

export async function updateAccount(id: string, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    currency: formData.get("currency") as string,
    balance: parseInt(formData.get("balance") as string, 10) || 0,
  };

  const result = accountSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      name: result.data.name,
      type: result.data.type,
      currency: result.data.currency,
      balance: result.data.balance,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  return { success: true };
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("accounts").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  return { success: true };
}
