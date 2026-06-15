"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAccountDialog } from "@/components/accounts/edit-account-dialog";
import { DeleteAccountDialog } from "@/components/accounts/delete-account-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@/types/database";

const ACCOUNT_TYPE_LABELS: Record<Account["type"], string> = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Cash",
  other: "Other",
};

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{account.name}</CardTitle>
            <p className="text-xs text-muted-foreground uppercase">
              {ACCOUNT_TYPE_LABELS[account.type]}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </CardContent>
      </Card>

      <EditAccountDialog
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteAccountDialog
        account={account}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
