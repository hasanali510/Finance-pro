import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'cat-inc-1', name: 'Salary', color: '#10B981', icon: 'briefcase', type: 'income' },
  { id: 'cat-inc-2', name: 'Freelance', color: '#3B82F6', icon: 'laptop', type: 'income' },
  { id: 'cat-inc-3', name: 'Investments', color: '#8B5CF6', icon: 'trending-up', type: 'income' },
  { id: 'cat-inc-4', name: 'Gifts', color: '#F59E0B', icon: 'gift', type: 'income' },
  { id: 'cat-inc-5', name: 'Other Income', color: '#64748B', icon: 'more-horizontal', type: 'income' },
  // Expense
  { id: 'cat-exp-1', name: 'Food', color: '#EF4444', icon: 'coffee', type: 'expense' },
  { id: 'cat-exp-2', name: 'Transport', color: '#F97316', icon: 'navigation', type: 'expense' },
  { id: 'cat-exp-3', name: 'Shopping', color: '#EC4899', icon: 'shopping-bag', type: 'expense' },
  { id: 'cat-exp-4', name: 'Bills', color: '#06B6D4', icon: 'file-text', type: 'expense' },
  { id: 'cat-exp-5', name: 'Health', color: '#14B8A6', icon: 'heart', type: 'expense' },
  { id: 'cat-exp-6', name: 'Education', color: '#8B5CF6', icon: 'book', type: 'expense' },
  { id: 'cat-exp-7', name: 'Investment', color: '#3B82F6', icon: 'trending-up', type: 'expense' },
  { id: 'cat-exp-8', name: 'Family', color: '#F59E0B', icon: 'users', type: 'expense' },
  { id: 'cat-exp-9', name: 'Others', color: '#64748B', icon: 'more-horizontal', type: 'expense' },
];

export const PAYMENT_METHODS = [
  { id: 'pm-1', name: 'Bank Transfer', icon: 'landmark' },
  { id: 'pm-2', name: 'Cash', icon: 'banknote' },
  { id: 'pm-3', name: 'Credit Card', icon: 'credit-card' },
  { id: 'pm-4', name: 'Debit Card', icon: 'credit-card' },
  { id: 'pm-5', name: 'Crypto', icon: 'bitcoin' },
  { id: 'pm-6', name: 'PayPal', icon: 'smartphone' },
];
