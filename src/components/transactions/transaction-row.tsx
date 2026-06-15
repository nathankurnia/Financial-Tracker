"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditTransactionDialog } from "@/components/transactions/edit-transactions-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/types/database";

interface TransactionRowProps {
  transaction: Transaction;
  account: Account | undefined;
  category: Category | undefined;
  accounts: Account[];
  categories: Category[];
}

export function TransactionRow({
  transaction,
  account,
  category,
  accounts,
  categories,
}: TransactionRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isIncome = transaction.type === "income";

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
            style={{
              backgroundColor: category?.color
                ? `${category.color}20`
                : "transparent",
            }}
          >
            {category?.icon ?? (isIncome ? "💰" : "💸")}
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-medium truncate">
              {transaction.description || category?.name || "Transaction"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {account?.name ?? "Unknown account"}
              {category && transaction.description ? ` · ${category.name}` : ""}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 shrink-0">
          <p
            className={cn(
              "font-semibold",
              isIncome ? "text-green-600" : "text-foreground",
            )}
          >
            {isIncome ? "+" : "−"}
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>

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
        </div>
      </div>

      <EditTransactionDialog
        transaction={transaction}
        accounts={accounts}
        categories={categories}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteTransactionDialog
        transaction={transaction}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
