import { useState, useMemo } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, Award, Lightbulb, Download, FileText } from 'lucide-react';
import { translations } from '../i18n';
import { generatePDFReport, ReportPeriod } from '../utils/pdfGenerator';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
}

export function Analytics({ transactions, categories, settings }: AnalyticsProps) {
  const t = translations[settings.language || 'en'].analytics;
  const tDash = translations[settings.language || 'en'].dashboard;
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([id, amount]) => ({
        name: categories.find((c) => c.id === id)?.name || 'Unknown',
        value: amount,
        color: categories.find((c) => c.id === id)?.color || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseTransactions, categories]);

  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStr = format(monthDate, 'MMM');
      const amount = expenseTransactions
        .filter((t) => format(parseISO(t.date), 'MMM yyyy') === format(monthDate, 'MMM yyyy'))
        .reduce((sum, t) => sum + t.amount, 0);
      data.push({ name: monthStr, amount });
    }
    return data;
  }, [expenseTransactions]);

  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageDailyExpense = totalExpense / (monthlyData.length * 30 || 1);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Simple Insights
  const insights = useMemo(() => {
    const msgs = [];
    if (categoryData.length > 0) {
      msgs.push(`You spent most on ${categoryData[0].name} overall.`);
    }
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 2].amount;
      const thisMonth = monthlyData[monthlyData.length - 1].amount;
      if (lastMonth > 0) {
        const diff = ((thisMonth - lastMonth) / lastMonth) * 100;
        if (diff > 0) {
          msgs.push(`Your expenses increased ${diff.toFixed(0)}% from last month.`);
        } else if (diff < 0) {
          msgs.push(`Your expenses decreased ${Math.abs(diff).toFixed(0)}% from last month.`);
        }
      }
    }
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    if (totalIncome > 0) {
      const saved = totalIncome - totalExpense;
      const savedPercent = (saved / totalIncome) * 100;
      if (savedPercent > 0) {
        msgs.push(`You are saving ${savedPercent.toFixed(0)}% of your income.`);
      }
    }
    return msgs;
  }, [categoryData, monthlyData, totalExpense, transactions]);

  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = async (period: ReportPeriod) => {
    setIsGeneratingReport(true);
    setIsReportMenuOpen(false);
    try {
      await generatePDFReport({
        transactions,
        categories,
        settings,
        period,
        chartElementId: 'analytics-pie-chart'
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15 }}
      className="pb-32 px-6 pt-12 space-y-8 max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        <div className="relative">
          <button 
            onClick={() => setIsReportMenuOpen(!isReportMenuOpen)}
            disabled={isGeneratingReport || transactions.length === 0}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/10 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isGeneratingReport ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="text-emerald-500 dark:text-emerald-400" size={20} />
            )}
          </button>

          <AnimatePresence>
            {isReportMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsReportMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 z-50 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Export PDF Report
                    </div>
                    {(['weekly', 'monthly', 'yearly', 'total'] as ReportPeriod[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => handleGenerateReport(period)}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors flex items-center gap-2 capitalize"
                      >
                        <FileText size={16} className="text-emerald-500" />
                        {period} Report
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-emerald-500 dark:text-emerald-400" size={18} />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Smart Insights</h2>
          </div>
          <ul className="space-y-2">
            {insights.map((msg, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-1">•</span> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full" />
          <TrendingUp className="text-rose-500 dark:text-rose-400 mb-3" size={20} />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Avg. Daily Exp.</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(averageDailyExpense)}</p>
        </div>
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full" />
          <Award className="text-teal-500 dark:text-teal-400 mb-3" size={20} />
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Top Category</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{categoryData[0]?.name || 'N/A'}</p>
        </div>
      </div>

      {/* Monthly Expense Trend */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Expense Trend</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                itemStyle={{ color: '#F43F5E', fontWeight: 600 }}
                labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                formatter={(value: number) => [formatCurrency(value), 'Expense']}
              />
              <Line type="monotone" dataKey="amount" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#0F172A' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown (Pie Chart) */}
      <div className="glass-card p-6" id="analytics-pie-chart">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.expenseBreakdown}</h2>
        <div className="h-56 w-full relative">
          {categoryData.length === 0 ? (
            <p className="text-slate-500 text-center py-20">{t.noData}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  itemStyle={{ fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Center Text */}
          {categoryData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpense)}</p>
            </div>
          )}
        </div>
        
        {/* Legend */}
        {categoryData.length > 0 && (
          <div className="mt-4 space-y-3">
            {categoryData.map((cat, index) => {
              const percentage = ((cat.value / totalExpense) * 100).toFixed(1);
              return (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{formatCurrency(cat.value)} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
