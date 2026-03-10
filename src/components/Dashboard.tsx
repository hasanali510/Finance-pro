import { useMemo, useState, useEffect } from 'react';
import { Transaction, Category, UserSettings, Account } from '../types';
import { format, isThisMonth, isToday, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Target, AlertCircle, Wallet, StickyNote, FileText } from 'lucide-react';
import { THEME_COLORS } from './AccountSelector';
import { translations } from '../i18n';

interface DashboardProps {
  account: Account;
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  onViewAll: () => void;
  onProfileClick: () => void;
  onViewNotes: () => void;
}

export function Dashboard({ account, transactions, categories, settings, onViewAll, onProfileClick, onViewNotes }: DashboardProps) {
  const stats = useMemo(() => {
    let todayExpense = 0;
    let monthExpense = 0;
    let totalExpense = 0;
    let totalIncome = 0;
    let monthIncome = 0;

    transactions.forEach((t) => {
      const date = parseISO(t.date);
      if (t.type === 'expense') {
        totalExpense += t.amount;
        if (isToday(date)) todayExpense += t.amount;
        if (isThisMonth(date)) monthExpense += t.amount;
      } else {
        totalIncome += t.amount;
        if (isThisMonth(date)) monthIncome += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;
    const monthSavings = monthIncome - monthExpense;

    return { todayExpense, monthExpense, totalExpense, totalIncome, balance, monthSavings, monthIncome };
  }, [transactions]);

  const topSpendingCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense' && isThisMonth(parseISO(t.date))).forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const cat = categories.find(c => c.id === sorted[0][0]);
      return { name: cat?.name || 'Unknown', amount: sorted[0][1], color: cat?.color || '#EF4444' };
    }
    return null;
  }, [transactions, categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const isPositive = stats.balance >= 0;
  
  const budgetProgress = Math.min((stats.monthExpense / settings.monthlyBudget) * 100, 100);
  const isOverBudget = stats.monthExpense > settings.monthlyBudget;
  
  const savingsProgress = Math.min((Math.max(stats.monthSavings, 0) / settings.savingsGoal) * 100, 100);
  const isSavingsGoalMet = stats.monthSavings >= settings.savingsGoal;

  const theme = THEME_COLORS.find(t => t.id === account.themeColor) || THEME_COLORS[0];
  const t = translations[settings.language || 'en'].dashboard;

  const isProfileComplete = account.name && account.email && account.mobile && account.profession;

  // Setup slides for the top carousel
  const slides = useMemo(() => {
    const items = [];
    if (!isProfileComplete) {
      items.push({
        id: 'profile',
        title: 'Complete Profile',
        subtitle: 'Unlock all features',
        icon: <AlertCircle size={20} />,
        action: 'Complete Now',
        onClick: onProfileClick,
        colors: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400',
        btnColors: 'bg-amber-500 hover:bg-amber-600 text-white'
      });
    }
    items.push({
      id: 'tip1',
      title: 'Track Smartly',
      subtitle: 'Keep an eye on daily expenses.',
      icon: <Target size={20} />,
      colors: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400',
    });
    items.push({
      id: 'tip2',
      title: 'Export Reports',
      subtitle: 'Download PDF reports anytime.',
      icon: <FileText size={20} />,
      colors: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400',
    });
    return items;
  }, [isProfileComplete, onProfileClick]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15 }}
      className="pb-32 px-6 pt-12 flex flex-col gap-6 max-w-xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-black/5 dark:border-white/10">
            <Wallet className="text-white" size={20} />
          </div>
          <div>
            <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Hisab Pro</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{account.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onViewNotes}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm transition-transform active:scale-95"
          >
            <StickyNote size={18} />
          </button>
          <button 
            onClick={onProfileClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-black/5 dark:ring-white/10 transition-transform active:scale-95 overflow-hidden ${theme.bg} ${theme.text}`}
          >
            {account.profileImage ? (
              <img src={account.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              account.avatar
            )}
          </button>
        </div>
      </div>

      {/* Top Carousel / Slider */}
      <div className="relative h-[72px] w-full">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: currentSlide === index ? 1 : 0, 
              x: currentSlide === index ? 0 : -20,
              pointerEvents: currentSlide === index ? 'auto' : 'none'
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`absolute inset-0 border rounded-2xl p-4 flex items-center justify-between shadow-sm ${slide.colors}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-black/20`}>
                {slide.icon}
              </div>
              <div>
                <p className="text-sm font-bold">{slide.title}</p>
                <p className="text-xs opacity-80">{slide.subtitle}</p>
              </div>
            </div>
            {slide.action && (
              <button 
                onClick={slide.onClick}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm ${slide.btnColors}`}
              >
                {slide.action}
              </button>
            )}
          </motion.div>
        ))}
        {/* Pagination Dots */}
        <div className="absolute -bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-4 bg-slate-600 dark:bg-slate-400' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`} 
            />
          ))}
        </div>
      </div>

      {/* Header - Static Balance Card */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/20 border border-black/5 dark:border-white/10 mt-2">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 dark:bg-black/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent to-black/5 dark:to-black/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-white/80 text-xs font-medium tracking-wider uppercase">{t.totalBalance}</p>
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 dark:border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">{t.active}</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-8">
            {formatCurrency(stats.balance)}
          </h1>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="bg-white/20 dark:bg-white/10 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md border border-white/20 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                <ArrowDownRight size={16} className="text-emerald-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium mb-0.5">{t.income}</p>
                <p className="text-sm font-bold text-white truncate">{formatCurrency(stats.monthIncome)}</p>
              </div>
            </div>

            {/* Expense */}
            <div className="bg-white/20 dark:bg-white/10 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md border border-white/20 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center shrink-0">
                <ArrowUpRight size={16} className="text-rose-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium mb-0.5">{t.expense}</p>
                <p className="text-sm font-bold text-white truncate">{formatCurrency(stats.monthExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Budget Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Budget Progress */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
              {t.monthlyBudget}
              {isOverBudget && <AlertCircle size={12} className="text-rose-500 dark:text-rose-400" />}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(stats.monthExpense)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">of {formatCurrency(settings.monthlyBudget)}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-slate-500 font-medium">Progress</span>
              <span className={`text-[10px] font-bold ${isOverBudget ? 'text-rose-500 dark:text-rose-400' : 'text-blue-500 dark:text-blue-400'}`}>
                {budgetProgress.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${budgetProgress}%` }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`}
              />
            </div>
          </div>
        </div>

        {/* Savings Goal Progress */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
              <Target size={12} className="text-emerald-500 dark:text-emerald-400" />
              {t.savingsGoal}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(Math.max(stats.monthSavings, 0))}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">of {formatCurrency(settings.savingsGoal)}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-slate-500 font-medium">Progress</span>
              <span className={`text-[10px] font-bold ${isSavingsGoalMet ? 'text-emerald-500 dark:text-emerald-400' : 'text-teal-500 dark:text-teal-400'}`}>
                {savingsProgress.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${savingsProgress}%` }}
                transition={{ duration: 0.15, ease: "easeOut", delay: 0.05 }}
                className={`h-full rounded-full ${isSavingsGoalMet ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Spending Category */}
      {topSpendingCategory && (
        <div className="glass-card p-5 flex items-center justify-between relative overflow-hidden border border-black/5 dark:border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.05] dark:opacity-[0.03]" style={{ backgroundColor: topSpendingCategory.color }} />
          <div className="z-10">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">{t.topSpending} ({t.thisMonth})</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topSpendingCategory.color }} />
              <p className="text-base font-medium text-slate-900 dark:text-white">{topSpendingCategory.name}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white z-10">{formatCurrency(topSpendingCategory.amount)}</p>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.recentActivity}</h2>
          <button onClick={onViewAll} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            {t.viewAll} <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="glass-card p-10 text-center flex flex-col items-center justify-center border border-black/5 dark:border-white/5">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <ArrowRight className="text-slate-400 dark:text-slate-500" size={20} />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{t.noTransactions}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tap the + button to add one</p>
            </div>
          ) : (
            recentTransactions.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="glass-card p-3.5 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/5">
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
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{format(parseISO(t.date), 'MMM dd, yyyy • hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className={`text-sm font-bold ${isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      {t.note && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[120px] truncate">{t.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
