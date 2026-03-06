import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Tags, DollarSign, ChevronRight, Shield, Bell, Target, LogOut, Trash2, RefreshCw } from 'lucide-react';
import { UserSettings, ViewState, Transaction, Category, Account } from '../types';

interface SettingsProps {
  account: Account;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onChangeView: (view: ViewState) => void;
  transactions: Transaction[];
  categories: Category[];
  onSwitchAccount: () => void;
  onDeleteAccount: () => void;
  onResetData: () => void;
}

export function Settings({ account, settings, onUpdateSettings, onChangeView, transactions, categories, onSwitchAccount, onDeleteAccount, onResetData }: SettingsProps) {
  const [budgetInput, setBudgetInput] = useState(settings.monthlyBudget.toString());
  const [savingsInput, setSavingsInput] = useState(settings.savingsGoal.toString());
  const [pinInput, setPinInput] = useState(settings.pinLock || '');

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ ...settings, monthlyBudget: val });
    }
  };

  const handleSaveSavings = () => {
    const val = parseFloat(savingsInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ ...settings, savingsGoal: val });
    }
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      onUpdateSettings({ ...settings, pinLock: pinInput });
    } else if (pinInput === '') {
      onUpdateSettings({ ...settings, pinLock: null });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      return [t.date, t.type, cat, t.amount, `"${t.note}"`].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${account.name}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-md mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
          <SettingsIcon className="text-slate-400" size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {/* Account Info */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">Current Account</p>
            <h2 className="text-lg font-bold text-white">{account.name}</h2>
          </div>
          <button
            onClick={onSwitchAccount}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={14} /> Switch
          </button>
        </div>

        {/* Budget Goal */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <DollarSign className="text-blue-400" size={16} />
            </div>
            <div>
              <h2 className="text-white font-medium text-sm">Monthly Budget</h2>
              <p className="text-[11px] text-slate-400">Set your spending limit</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
              placeholder="e.g. 2000"
            />
            <button
              onClick={handleSaveBudget}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Savings Goal */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Target className="text-emerald-400" size={16} />
            </div>
            <div>
              <h2 className="text-white font-medium text-sm">Savings Goal</h2>
              <p className="text-[11px] text-slate-400">Target monthly savings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={savingsInput}
              onChange={(e) => setSavingsInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
              placeholder="e.g. 500"
            />
            <button
              onClick={handleSaveSavings}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* App Lock */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
              <Shield className="text-purple-400" size={16} />
            </div>
            <div>
              <h2 className="text-white font-medium text-sm">App Lock (PIN)</h2>
              <p className="text-[11px] text-slate-400">Leave blank to disable</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 tracking-[0.5em] font-mono"
              placeholder="****"
            />
            <button
              onClick={handleSavePin}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Categories Link */}
        <button
          onClick={() => onChangeView('categories')}
          className="w-full glass-card p-4 flex items-center justify-between group hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shrink-0">
              <Tags className="text-teal-400" size={16} />
            </div>
            <div className="text-left">
              <h2 className="text-white font-medium text-sm">Manage Categories</h2>
              <p className="text-[11px] text-slate-400">Add or remove categories</p>
            </div>
          </div>
          <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={18} />
        </button>

        {/* Export Data */}
        <button
          onClick={handleExportCSV}
          className="w-full glass-card p-4 flex items-center justify-between group hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
              <Download className="text-orange-400" size={16} />
            </div>
            <div className="text-left">
              <h2 className="text-white font-medium text-sm">Export Data</h2>
              <p className="text-[11px] text-slate-400">Download CSV report</p>
            </div>
          </div>
          <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={18} />
        </button>

        {/* Danger Zone */}
        <div className="pt-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Danger Zone</p>
          <div className="space-y-2">
            <button
              onClick={onResetData}
              className="w-full glass-card p-3.5 flex items-center justify-between group hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors shrink-0">
                  <RefreshCw className="text-rose-400" size={14} />
                </div>
                <div className="text-left">
                  <h2 className="text-rose-400 font-medium text-sm">Reset Account Data</h2>
                  <p className="text-[11px] text-slate-400">Clear all transactions</p>
                </div>
              </div>
            </button>

            <button
              onClick={onDeleteAccount}
              className="w-full glass-card p-3.5 flex items-center justify-between group hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors shrink-0">
                  <Trash2 className="text-red-500" size={14} />
                </div>
                <div className="text-left">
                  <h2 className="text-red-500 font-medium text-sm">Delete Account</h2>
                  <p className="text-[11px] text-slate-400">Permanently remove account</p>
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
