import { useState, useMemo } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { translations } from '../i18n';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Edit2 } from 'lucide-react';

interface HistoryProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  settings: UserSettings;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

export function History({ transactions, categories, onDelete, settings }: HistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const date = parseISO(t.date);
        if (filter === 'today' && !isToday(date)) return false;
        if (filter === 'week' && !isThisWeek(date)) return false;
        if (filter === 'month' && !isThisMonth(date)) return false;
        
        if (searchQuery) {
          const cat = categories.find(c => c.id === t.categoryId);
          const searchLower = searchQuery.toLowerCase();
          return (
            t.note.toLowerCase().includes(searchLower) ||
            (cat && cat.name.toLowerCase().includes(searchLower))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, searchQuery, categories]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

  const t = translations[settings.language || 'en'].history;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/10 shadow-sm">
          <Filter className="text-blue-500 dark:text-blue-400" size={20} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {(['all', 'today', 'week', 'month'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors relative ${
              filter === f ? 'text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-black/5 dark:border-transparent shadow-sm dark:shadow-none'
            }`}
          >
            {filter === f && (
              <motion.div
                layoutId="history-filter-indicator"
                className="absolute inset-0 bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              />
            )}
            <span className="relative z-10">{t.filters[f]}</span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center"
            >
              <Search size={40} className="mb-4 text-slate-600 opacity-50" />
              <p>{t.noTransactionsFound}</p>
            </motion.div>
          ) : (
            filteredTransactions.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const isIncome = t.type === 'income';
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  key={t.id}
                  className="glass-card p-4 flex items-center justify-between group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 z-10">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{category?.name || 'Unknown'}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isIncome ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                          {isIncome ? translations[settings.language || 'en'].dashboard.income : translations[settings.language || 'en'].dashboard.expense}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{format(parseISO(t.date), 'MMM dd, yyyy • HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right z-10 flex items-center gap-4">
                    <div>
                      <p className={`font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[80px]">{t.note || 'No note'}</p>
                    </div>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
