import { useState } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { Analytics } from './Analytics';
import { History } from './History';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Calendar as CalendarIcon, X } from 'lucide-react';
import { generatePDFReport, ReportPeriod } from '../utils/pdfGenerator';
import { format } from 'date-fns';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  onDeleteTransaction: (id: string) => void;
}

export function Reports({ transactions, categories, settings, onDeleteTransaction }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics');
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleGenerateReport = async (period: ReportPeriod) => {
    if (period === 'custom' && (!customStartDate || !customEndDate)) {
      return;
    }

    setIsGeneratingReport(true);
    setIsReportMenuOpen(false);
    setShowCustomDateModal(false);
    
    try {
      await generatePDFReport({
        transactions,
        categories,
        settings,
        period,
        customStartDate: period === 'custom' ? new Date(customStartDate) : undefined,
        customEndDate: period === 'custom' ? new Date(customEndDate) : undefined,
        chartElementId: activeTab === 'analytics' ? 'analytics-pie-chart' : undefined
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="pb-32 px-6 pt-12 flex flex-col gap-6 max-w-xl mx-auto h-full relative">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        
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
                    <button
                      onClick={() => {
                        setIsReportMenuOpen(false);
                        setShowCustomDateModal(true);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <CalendarIcon size={16} className="text-emerald-500" />
                      Custom Date
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showCustomDateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-4 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 dark:text-white">Custom Date Range</h3>
                <button 
                  onClick={() => setShowCustomDateModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => handleGenerateReport('custom')}
                  disabled={!customStartDate || !customEndDate}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
