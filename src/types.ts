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

export type Note = {
  id: string;
  title?: string;
  text: string;
  color?: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt?: number;
};

export type UserSettings = {
  currency: string;
  monthlyBudget: number;
  savingsGoal: number;
  pinLock: string | null;
  hasCompletedOnboarding: boolean;
  language: 'en' | 'bn';
  theme: 'dark' | 'light' | 'system';
};

export type Account = {
  id: string;
  name: string;
  avatar: string;
  themeColor: string;
  createdAt: string;
  profession?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
};

export type ViewState = 'dashboard' | 'analytics' | 'history' | 'reports' | 'categories' | 'settings' | 'profile' | 'notes';

declare global {
  interface Window {
    Android?: {
      downloadFile: (base64: string, fileName: string, mimeType: string) => void;
    };
  }
}
