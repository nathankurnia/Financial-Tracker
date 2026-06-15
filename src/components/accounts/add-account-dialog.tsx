"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount } from "@/app/(app)/dashboard/accounts/actions";
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  parseCurrencyInput,
} from "@/lib/utils";
import type { Currency } from "@/types/database";

const schema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["bank", "ewallet", "cash", "other"]),
  currency: z.enum(["EUR", "IDR"]),
  balance: z.string().min(1, "Balance is required"),
});

type FormData = z.infer<typeof schema>;

const ACCOUNT_TYPE_LABELS: Record<FormData["type"], string> = {
  bank: "Bank Account",
  ewallet: "Digital Wallet",
  cash: "Cash",
  other: "Other",
};

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "bank", currency: "EUR", balance: "0" },
  });

  const selectedType = watch("type");
  const selectedCurrency = watch("currency");

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setIsPending(true);

    const balanceInSmallestUnit = parseCurrencyInput(
      data.balance,
      data.currency,
    );

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("currency", data.currency);
    formData.append("balance", String(balanceInSmallestUnit));

    const result = await createAccount(formData);
    setIsPending(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    toast.success("Account created successfully!");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">+ Add Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Add a bank account, digital wallet , or other source of funds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g. Sparkasse, N26, Cash"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructivee#">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  setValue("type", value as FormData["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) =>
                  setValue("currency", value as Currency)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {CURRENCY_LABELS[curr]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="balance">
              Initial Balance ({selectedCurrency})
            </Label>
            <Input
              id="balance"
              type="text"
              inputMode="decimal"
              placeholder={selectedCurrency === "EUR" ? "0,00" : "0"}
              {...register("balance")}
            />
            <p className="text-xs text-muted-foreground">
              {selectedCurrency === "EUR"
                ? "Enter amount in euros (e.g. 50,99 or 50.99)"
                : "Enter amount in rupiah (e.g. 50000 or 50.000)"}
            </p>
            {errors.balance && (
              <p className="text-sm text-destructive">
                {errors.balance.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
