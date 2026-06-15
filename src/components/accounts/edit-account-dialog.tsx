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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAccount } from "@/app/(app)/dashboard/accounts/actions";
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
  parseCurrencyInput,
  formatCurrency,
} from "@/lib/utils";
import type { Account, Currency } from "@/types/database";

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

interface EditAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
}: EditAccountDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const initialBalanceDisplay = formatCurrency(
    account.balance,
    account.currency as Currency,
  )
    .replace(/[^d.,]/g, "")
    .trim();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: initialBalanceDisplay,
    },
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

    const result = await updateAccount(account.id, formData);
    setIsPending(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    toast.success("Account updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update account details. Changing currency will not convert the
            balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Account Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g. Sparkasse, N26, Cash"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-type">Type</Label>
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
              <Label htmlFor="edit-currency">Currency</Label>
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
            <Label htmlFor="edit-balance">Balance ({selectedCurrency})</Label>
            <Input
              id="edit-balance"
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
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
