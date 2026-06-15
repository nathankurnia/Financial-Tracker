export type Currency = "EUR" | "IDR";

export type AccountType = "bank" | "ewallet" | "cash" | "other";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  icon: string | null;
  created_at: string;
};

export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  budget_limit: number | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: "income" | "expense";
  currency: Currency;
  description: string | null;
  transaction_date: string;
  created_at: string;
};
