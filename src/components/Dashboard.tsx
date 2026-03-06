import { useMemo } from 'react';
import { Transaction, Category, UserSettings, Account } from '../types';
import { format, isThisMonth, isToday, isThisYear, parseISO, subMonths } from 'date-fns';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, ArrowRight, Target, AlertCircle } from 'lucide-react';
import { THEME_COLORS } from './AccountSelector';

interface DashboardProps {
  account: Account;
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  onViewAll: () => void;
}

export function Dashboard({ account, transactions, categories, settings, onViewAll }: DashboardProps) {
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

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStr = format(monthDate, 'MMM');
      const monthTransactions = transactions.filter(
        (t) => format(parseISO(t.date), 'MMM yyyy') === format(monthDate, 'MMM yyyy')
      );
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({ name: monthStr, income, expense });
    }
    return data;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32 px-6 pt-12 space-y-8 max-w-md mx-auto"
    >
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg border border-white/10">
            <Wallet className="text-white" size={20} />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">FinancePro</span>
            <p className="text-xs text-slate-400 font-medium">{account.name}</p>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ring-1 ring-white/20 ${theme.bg} ${theme.text}`}>
          {account.avatar}
        </div>
      </div>

      {/* Header - Balance Card */}
      <div className="glass-card p-6 relative overflow-hidden mb-2">
        <div className="z-10 relative">
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-2">Total Balance</p>
          <h1 className="text-5xl font-light tracking-tight text-white">
            {formatCurrency(stats.balance)}
          </h1>
          
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ArrowDownRight size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Income (This Month)</p>
                <p className="text-base font-bold text-emerald-400">{formatCurrency(stats.monthIncome)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <ArrowUpRight size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Expense (This Month)</p>
                <p className="text-base font-bold text-rose-400">{formatCurrency(stats.monthExpense)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${
          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
      </div>

      {/* Goals & Budget Section */}
      <div className="space-y-4">
        {/* Budget Progress */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                Monthly Budget
                {isOverBudget && <AlertCircle size={12} className="text-rose-400" />}
              </p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(stats.monthExpense)} <span className="text-sm font-normal text-slate-500">/ {formatCurrency(settings.monthlyBudget)}</span>
              </p>
            </div>
            <p className={`text-sm font-semibold ${isOverBudget ? 'text-rose-400' : 'text-blue-400'}`}>
              {budgetProgress.toFixed(0)}%
            </p>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${budgetProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
            />
          </div>
        </div>

        {/* Savings Goal Progress */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target size={12} className="text-emerald-400" />
                Savings Goal
              </p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(Math.max(stats.monthSavings, 0))} <span className="text-sm font-normal text-slate-500">/ {formatCurrency(settings.savingsGoal)}</span>
              </p>
            </div>
            <p className={`text-sm font-semibold ${isSavingsGoalMet ? 'text-emerald-400' : 'text-teal-400'}`}>
              {savingsProgress.toFixed(0)}%
            </p>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${savingsProgress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`h-full rounded-full ${isSavingsGoalMet ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]'}`}
            />
          </div>
        </div>
      </div>



      {/* Main Chart */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Cash Flow</h2>
          <span className="text-xs font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-full border border-white/10">
            6 Months
          </span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                itemStyle={{ fontWeight: 600 }}
                labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  <span style={{ color: name === 'income' ? '#10B981' : '#F43F5E', textTransform: 'capitalize' }}>{name}</span>
                ]}
              />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Spending Category */}
      {topSpendingCategory && (
        <div className="glass-card p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10" style={{ backgroundColor: topSpendingCategory.color }} />
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Top Spending (This Month)</p>
            <p className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: topSpendingCategory.color }} />
              {topSpendingCategory.name}
            </p>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(topSpendingCategory.amount)}</p>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <button onClick={onViewAll} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">
              No transactions recorded yet.
            </div>
          ) : (
            recentTransactions.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{category?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{format(parseISO(t.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[80px]">{t.note || 'No note'}</p>
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
