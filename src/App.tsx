import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useSupabaseStorage } from './hooks/useSupabaseStorage';
import { Transaction, Category, ViewState, UserSettings, Account, Note } from './types';
import { DEFAULT_CATEGORIES } from './constants';

import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { Reports } from './components/Reports';
import { Categories } from './components/Categories';
import { Settings } from './components/Settings';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Onboarding } from './components/Onboarding';
import { PinLock } from './components/PinLock';
import { AccountSelector } from './components/AccountSelector';
import { Auth } from './components/Auth';

import { Notes } from './components/Notes';
import { Profile } from './components/Profile';

interface MainAppProps {
  key?: string;
  userId: string;
  account: Account;
  onSwitchAccount: () => void;
  onDeleteAccount: () => void;
  onUpdateAccount: (updatedAccount: Account) => void;
}

function MainApp({ userId, account, onSwitchAccount, onDeleteAccount, onUpdateAccount }: MainAppProps) {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [transactions, setTransactions] = useSupabaseStorage<Transaction[]>(`${userId}_smart-income-transactions-${account.id}`, []);
  const [categories, setCategories] = useSupabaseStorage<Category[]>(`${userId}_smart-income-categories-${account.id}`, DEFAULT_CATEGORIES);
  const [notes, setNotes] = useSupabaseStorage<Note[]>(`${userId}_smart-income-notes-${account.id}`, []);
  const [settings, setSettings] = useSupabaseStorage<UserSettings>(`${userId}_smart-income-settings-${account.id}`, {
    currency: 'USD',
    monthlyBudget: 2000,
    savingsGoal: 500,
    pinLock: null,
    hasCompletedOnboarding: false,
    language: 'en',
    theme: 'dark',
  });

  useEffect(() => {
    if (!settings.pinLock) {
      setIsUnlocked(true);
    }
  }, [settings.pinLock]);

  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Listen for system theme changes if set to 'system'
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleAddTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: uuidv4(),
    };
    setTransactions((prev) => [...prev, transaction]);
    addToast(`Successfully added ${transaction.type}`, 'success');
  }, [setTransactions, addToast]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('Transaction deleted', 'info');
  }, [setTransactions, addToast]);

  const handleAddNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const note: Note = {
      id: uuidv4(),
      ...noteData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [...prev, note]);
    addToast('Note added', 'success');
  }, [setNotes, addToast]);

  const handleEditNote = useCallback((id: string, noteData: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...noteData, updatedAt: Date.now() } : n));
    addToast('Note updated', 'success');
  }, [setNotes, addToast]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    addToast('Note deleted', 'info');
  }, [setNotes, addToast]);

  const handleAddCategory = useCallback((newCategory: Omit<Category, 'id'>) => {
    const category: Category = {
      ...newCategory,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, category]);
    addToast('Category added', 'success');
  }, [setCategories, addToast]);

  const handleEditCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('Category updated', 'success');
  }, [setCategories, addToast]);

  const handleDeleteCategory = useCallback((id: string) => {
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      addToast('Cannot delete category in use', 'error');
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category deleted', 'info');
  }, [setCategories, addToast, transactions]);

  const handleResetData = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data for this account? This cannot be undone.')) {
      setTransactions([]);
      setCategories(DEFAULT_CATEGORIES);
      setNotes([]);
      addToast('Account data reset successfully', 'success');
    }
  }, [setTransactions, setCategories, setNotes, addToast]);

  if (!settings.hasCompletedOnboarding) {
    return <Onboarding onComplete={() => setSettings({ ...settings, hasCompletedOnboarding: true })} settings={settings} />;
  }

  if (settings.pinLock && !isUnlocked) {
    return <PinLock correctPin={settings.pinLock} onUnlock={() => setIsUnlocked(true)} settings={settings} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-b dark:from-[#0F172A] dark:to-[#0B1120] text-slate-900 dark:text-slate-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" className="w-full h-full">
            <Dashboard
              account={account}
              transactions={transactions}
              categories={categories}
              settings={settings}
              onViewAll={() => setView('reports')}
              onProfileClick={() => setView('profile')}
              onViewNotes={() => setView('notes')}
            />
          </motion.div>
        )}
        {view === 'reports' && (
          <motion.div key="reports" className="w-full h-full">
            <Reports
              transactions={transactions}
              categories={categories}
              settings={settings}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </motion.div>
        )}
        {view === 'categories' && (
          <motion.div key="categories" className="w-full h-full">
            <Categories
              categories={categories}
              onAdd={handleAddCategory}
              onDelete={handleDeleteCategory}
              onEdit={handleEditCategory}
              onBack={() => setView('settings')}
              settings={settings}
            />
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div key="settings" className="w-full h-full">
            <Settings
              account={account}
              settings={settings}
              onUpdateSettings={setSettings}
              onChangeView={setView}
              transactions={transactions}
              categories={categories}
              onSwitchAccount={onSwitchAccount}
              onDeleteAccount={onDeleteAccount}
              onResetData={handleResetData}
              addToast={addToast}
            />
          </motion.div>
        )}
        {view === 'notes' && (
          <motion.div key="notes" className="w-full h-full">
            <Notes
              notes={notes}
              onAdd={handleAddNote}
              onDelete={handleDeleteNote}
              onEdit={handleEditNote}
              settings={settings}
            />
          </motion.div>
        )}
        {view === 'profile' && (
          <motion.div key="profile" className="w-full h-full">
            <Profile
              account={account}
              onUpdateAccount={onUpdateAccount}
              onBack={() => setView('dashboard')}
              addToast={addToast}
              settings={settings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav
        currentView={view}
        onChangeView={setView}
        onAddClick={() => setIsAddModalOpen(true)}
        settings={settings}
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
        categories={categories}
        settings={settings}
      />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <AppContent userId={session.user.id} />;
}

function AppContent({ userId }: { userId: string }) {
  const [accounts, setAccounts, accountsLoaded] = useSupabaseStorage<Account[]>(`${userId}_smart-income-accounts`, []);
  const [currentAccountId, setCurrentAccountId, currentAccountLoaded] = useSupabaseStorage<string | null>(`${userId}_smart-income-current-account`, null);

  useEffect(() => {
    if (accountsLoaded && accounts.length === 0) {
      const defaultAccount: Account = {
        id: uuidv4(),
        name: 'Personal Wallet',
        icon: 'wallet',
        currency: 'USD',
        themeColor: 'emerald',
        createdAt: new Date().toISOString()
      };
      setAccounts([defaultAccount]);
      setCurrentAccountId(defaultAccount.id);
    }
  }, [accountsLoaded, accounts.length, setAccounts, setCurrentAccountId]);

  const handleCreateAccount = (newAccount: Account) => {
    setAccounts([...accounts, newAccount]);
    setCurrentAccountId(newAccount.id);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete this wallet completely?')) {
      setAccounts(accounts.filter(a => a.id !== currentAccountId));
      setCurrentAccountId(null);
    }
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  };

  const currentAccount = accounts.find(a => a.id === currentAccountId);

  if (!accountsLoaded || !currentAccountLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentAccountId || !currentAccount) {
    return (
      <AccountSelector
        accounts={accounts}
        onSelect={setCurrentAccountId}
        onCreate={handleCreateAccount}
      />
    );
  }

  return (
    <MainApp
      key={currentAccountId}
      userId={userId}
      account={currentAccount}
      onSwitchAccount={() => setCurrentAccountId(null)}
      onDeleteAccount={handleDeleteAccount}
      onUpdateAccount={handleUpdateAccount}
    />
  );
}

