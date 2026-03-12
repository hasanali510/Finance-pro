import { useState, useMemo } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { translations } from '../i18n';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Edit2, FileText } from 'lucide-react';

interface HistoryProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  settings: UserSettings;
  hideHeader?: boolean;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

export function History({ transactions, categories, onDelete, settings, hideHeader }: HistoryProps) {
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

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
      const dateStr = format(parseISO(t.date), 'MMM dd, yyyy');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });
    return Object.entries(groups);
  }, [filteredTransactions]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency || 'USD', maximumFractionDigits: 2, currencyDisplay: 'narrowSymbol' }).format(val);

  const t = translations[settings.language || 'en'].history;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15 }}
      className={`${hideHeader ? 'pb-32 pt-4' : 'pb-32 px-6 pt-12'} space-y-6 max-w-xl mx-auto`}
    >
      {!hideHeader && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/10 shadow-sm">
            <Filter className="text-blue-500 dark:text-blue-400" size={20} />
          </div>
        </div>
      )}

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
                transition={{ type: 'spring', bounce: 0.2, duration: 0.15 }}
              />
            )}
            <span className="relative z-10">{t.filters[f]}</span>
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center border border-black/5 dark:border-white/5"
            >
              <Search size={40} className="mb-4 text-slate-600 opacity-50" />
              <p>{t.noTransactionsFound}</p>
            </motion.div>
          ) : (
            groupedTransactions.map(([date, dayTransactions]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">{date}</h3>
                <div className="space-y-2">
                  {dayTransactions.map((t) => {
                    const category = categories.find((c) => c.id === t.categoryId);
                    const isIncome = t.type === 'income';
                    return (
                      <div key={t.id} className="glass-card p-3.5 flex flex-col gap-2 group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/5 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                              style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                            >
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category?.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{category?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{format(parseISO(t.date), 'hh:mm a')}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <p className={`text-sm font-bold ${isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                              </p>
                              {t.note && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[120px] truncate">{t.note}</p>
                              )}
                            </div>
                            <button
                              onClick={() => onDelete(t.id)}
                              className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
