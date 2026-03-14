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
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const isProfileComplete = Boolean(account.name && account.profession && account.email && account.mobile);

  const handleViewChange = (newView: ViewState) => {
    if (newView === 'notes' && !isProfileComplete) {
      setIsPremiumModalOpen(true);
      return;
    }
    setView(newView);
  };
  
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
              onViewAll={() => handleViewChange('reports')}
              onProfileClick={() => handleViewChange('profile')}
              onViewNotes={() => handleViewChange('notes')}
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
              onBack={() => handleViewChange('settings')}
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
              onChangeView={handleViewChange}
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
              onBack={() => handleViewChange('dashboard')}
              addToast={addToast}
              settings={settings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav
        currentView={view}
        onChangeView={handleViewChange}
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

      <AnimatePresence>
        {isPremiumModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsPremiumModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Premium Feature</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Notepad is a premium feature. Please complete your profile (Profession, Mobile) to unlock it for free!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsPremiumModalOpen(false);
                      handleViewChange('profile');
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Complete Profile Now
                  </button>
                  <button
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    }).catch((err) => {
      console.error('Error getting session:', err);
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

  return <AppContent session={session} />;
}

function AppContent({ session }: { session: Session }) {
  const userId = session.user.id;
  const [accounts, setAccounts, accountsLoaded] = useSupabaseStorage<Account[]>(`${userId}_smart-income-accounts`, []);
  const [currentAccountId, setCurrentAccountId, currentAccountLoaded] = useSupabaseStorage<string | null>(`${userId}_smart-income-current-account`, null);

  useEffect(() => {
    if (accountsLoaded && accounts.length === 0) {
      const defaultAccount: Account = {
        id: uuidv4(),
        name: session.user.user_metadata?.full_name || 'Personal Wallet',
        avatar: (session.user.user_metadata?.full_name || 'P').substring(0, 2).toUpperCase(),
        email: session.user.email,
        themeColor: 'emerald',
        createdAt: new Date().toISOString()
      };
      setAccounts([defaultAccount]);
      setCurrentAccountId(defaultAccount.id);
    }
  }, [accountsLoaded, accounts.length, setAccounts, setCurrentAccountId, session]);

  const handleCreateAccount = (newAccount: Account) => {
    if (accounts.length >= 3) {
      alert('You can only create up to 3 profiles.');
      return;
    }
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

