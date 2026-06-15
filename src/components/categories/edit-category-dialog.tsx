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
import { updateCategory } from "@/app/(app)/dashboard/categories/actions";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/category-constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

const schema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"]),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  budget_limit: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategoryDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      budget_limit: category.budget_limit?.toString() ?? "",
    },
  });

  const selectedType = watch("type");
  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setIsPending(true);

    const formData = new FormData();
    formData.append("name", data.type);
    formData.append("type", data.type);
    if (data.color) formData.append("color", data.color);
    if (data.icon) formData.append("icon", data.icon);
    if (data.budget_limit) {
      formData.append("budget_limit", data.budget_limit);
    }

    const result = await updateCategory(category.id, formData);
    setIsPending(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    toast.success("Category updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update category details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cat-name">Category Name</Label>
            <Input
              id="edit-cat-name"
              placeholder="e.g. Mensa, Groceries, BVG"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cat-type">Type</Label>
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
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-10 gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() =>
                    setValue("icon", icon.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors",
                    selectedIcon === icon.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted",
                  )}
                  title={icon.name}
                >
                  {icon.value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setValue("color", color.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    selectedColor === color.value
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cat-budget">
              Monthly Budget Limit{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="edit-cat-budget"
              type="number"
              min="0"
              placeholder="Leave empty for no limit"
              {...register("budget_limit")}
            />
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
