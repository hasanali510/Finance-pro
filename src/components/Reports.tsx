import { useState } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { Analytics } from './Analytics';
import { History } from './History';
import { motion } from 'framer-motion';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  onDeleteTransaction: (id: string) => void;
}

export function Reports({ transactions, categories, settings, onDeleteTransaction }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics');

  return (
    <div className="pb-32 px-6 pt-12 flex flex-col gap-6 max-w-xl mx-auto h-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      </div>

      <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm border border-black/5 dark:border-white/5">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto -mx-6 px-6">
        {activeTab === 'analytics' ? (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Analytics transactions={transactions} categories={categories} settings={settings} hideHeader />
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <History transactions={transactions} categories={categories} settings={settings} onDelete={onDeleteTransaction} hideHeader />
          </motion.div>
        )}
      </div>
    </div>
  );
}
