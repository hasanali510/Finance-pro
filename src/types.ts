export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // ISO string
  note: string;
  paymentMethod: string;
  isRecurring?: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRecurrenceDate?: string;
};

export type UserSettings = {
  currency: string;
  monthlyBudget: number;
  savingsGoal: number;
  pinLock: string | null;
  hasCompletedOnboarding: boolean;
};

export type Account = {
  id: string;
  name: string;
  avatar: string;
  themeColor: string;
  createdAt: string;
};

export type ViewState = 'dashboard' | 'analytics' | 'history' | 'categories' | 'settings';
