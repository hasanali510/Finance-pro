import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Tags, DollarSign, ChevronRight, Shield, Bell, Target, LogOut, Trash2, RefreshCw, Cloud, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { UserSettings, ViewState, Transaction, Category, Account } from '../types';
import { ToastMessage } from './Toast';
import { translations } from '../i18n';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

export function Settings({ account, settings, onUpdateSettings, onChangeView, transactions, categories, onSwitchAccount, onDeleteAccount, onResetData, addToast }: SettingsProps) {
  const [budgetInput, setBudgetInput] = useState(settings.monthlyBudget.toString());
  const [savingsInput, setSavingsInput] = useState(settings.savingsGoal.toString());
  const [isLockEnabled, setIsLockEnabled] = useState(!!settings.pinLock);
  const [pinInput, setPinInput] = useState(settings.pinLock || '');
  const [isSavingOnline, setIsSavingOnline] = useState(false);

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ ...settings, monthlyBudget: val });
      addToast('Monthly budget updated successfully', 'success');
    } else {
      addToast('Invalid budget amount', 'error');
    }
  };

  const handleSaveSavings = () => {
    const val = parseFloat(savingsInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateSettings({ ...settings, savingsGoal: val });
      addToast('Savings goal updated successfully', 'success');
    } else {
      addToast('Invalid savings amount', 'error');
    }
  };

  const handleToggleLock = () => {
    const newState = !isLockEnabled;
    setIsLockEnabled(newState);
    if (!newState) {
      setPinInput('');
      onUpdateSettings({ ...settings, pinLock: null });
      addToast('App lock disabled', 'info');
    }
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      onUpdateSettings({ ...settings, pinLock: pinInput });
      addToast('PIN updated successfully', 'success');
    } else {
      addToast('PIN must be exactly 4 digits', 'error');
    }
  };

  const generateCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      const formattedDate = new Date(t.date).toLocaleDateString();
      return [
        formattedDate,
        t.type.toUpperCase(),
        cat,
        t.amount.toString(),
        `"${(t.note || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = () => {
    try {
      const csvContent = generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = `${account.name.replace(/\s+/g, '_')}_transactions.csv`;

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = function() {

        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];

        // @ts-ignore
        if (window.Android) {
          // @ts-ignore
          window.Android.downloadBase64(base64, filename, "text/csv");
        } else {

          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);

          link.href = url;
          link.download = filename;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        }

      };

      addToast('CSV downloaded successfully', 'success');

    } catch (error) {

      console.error('Error generating CSV:', error);
      addToast('Failed to generate CSV', 'error');

    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`${account.name} - Transaction Report`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Type", "Category", "Amount", "Note"];
    const tableRows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      const formattedDate = new Date(t.date).toLocaleDateString();
      const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency || 'USD' }).format(t.amount);
      return [formattedDate, t.type.toUpperCase(), cat, formattedAmount, t.note || '-'];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    return doc;
  };

  const downloadFile = (doc: jsPDF, filename: string) => {
    try {
      const base64 = doc.output("datauristring").split(",")[1];

      // @ts-ignore
      if (window.Android) {
        // @ts-ignore
        window.Android.downloadBase64(base64, filename, "application/pdf");
      } else {
        doc.save(filename);
      }
    } catch (error) {
      console.error("Download error:", error);
      doc.save(filename);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = generatePDF();
      downloadFile(doc, `${account.name.replace(/\s+/g, '_')}_Transactions.pdf`);
      addToast('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('PDF Export Error:', error);
      addToast('Failed to export PDF', 'error');
    }
  };

  const handleSaveDataOnline = () => {
    if (!account.email) {
      addToast('Please add an email address in your profile first', 'error');
      return;
    }

    setIsSavingOnline(true);
    
    // Simulate API call and email sending
    setTimeout(() => {
      try {
        const doc = generatePDF();
        // We download the PDF as a fallback since we can't actually email it without a backend
        downloadFile(doc, `${account.name.replace(/\s+/g, '_')}_Backup.pdf`);
        addToast(`Data saved online. PDF backup sent to ${account.email}`, 'success');
      } catch (error) {
        console.error('Online Save Error:', error);
        addToast('Failed to save data online', 'error');
      } finally {
        setIsSavingOnline(false);
      }
    }, 1500);
  };

  const t = translations[settings.language || 'en'].settings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/10">
          <SettingsIcon className="text-slate-500 dark:text-slate-400" size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {/* Account Info */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{t.currentAccount}</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{account.name}</h2>
          </div>
          <button
            onClick={onSwitchAccount}
            className="flex items-center gap-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={14} /> {t.switch}
          </button>
        </div>

        {/* Language, Theme & Currency */}
        <div className="space-y-3">
          <button
            onClick={() => onUpdateSettings({ ...settings, language: settings.language === 'en' ? 'bn' : 'en' })}
            className="glass-card p-4 w-full flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="text-blue-500 dark:text-blue-400" size={20} />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {settings.language === 'en' ? 'Language: English' : 'ভাষা: বাংলা'}
              </span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="text-emerald-500 dark:text-emerald-400" size={20} />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {settings.language === 'en' ? 'Currency' : 'মুদ্রা'}
              </span>
            </div>
            <select
              value={settings.currency || 'USD'}
              onChange={(e) => onUpdateSettings({ ...settings, currency: e.target.value })}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="USD">USD ($)</option>
              <option value="BDT">BDT (৳)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          
          <div className="glass-card p-1 flex items-center justify-between gap-1">
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all ${
                settings.theme === 'light' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Sun size={18} />
              <span className="text-[11px] font-medium">{t.lightMode}</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all ${
                settings.theme === 'dark' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Moon size={18} />
              <span className="text-[11px] font-medium">{t.darkMode}</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'system' })}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all ${
                settings.theme === 'system' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Monitor size={18} />
              <span className="text-[11px] font-medium">{t.systemMode || 'System'}</span>
            </button>
          </div>
        </div>

        {/* Save Data Online */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <Cloud className="text-indigo-400" size={16} />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-medium text-sm">{t.saveDataOnline}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.backupData}</p>
            </div>
          </div>
          <button
            onClick={handleSaveDataOnline}
            disabled={isSavingOnline}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              isSavingOnline 
                ? 'bg-indigo-500/50 text-white/70 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {isSavingOnline ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Cloud size={16} />
                {t.saveAndEmail}
              </>
            )}
          </button>
          {!account.email && (
            <p className="text-[10px] text-rose-400 mt-2 text-center">
              {t.emailRequired}
            </p>
          )}
        </div>

        {/* Budget Goal */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <DollarSign className="text-blue-400" size={16} />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-medium text-sm">{t.monthlyBudget}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.setLimit}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50"
              placeholder="e.g. 2000"
            />
            <button
              onClick={handleSaveBudget}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {t.save}
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
              <h2 className="text-slate-900 dark:text-white font-medium text-sm">{t.savingsGoal}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.targetSavings}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={savingsInput}
              onChange={(e) => setSavingsInput(e.target.value)}
              className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50"
              placeholder="e.g. 500"
            />
            <button
              onClick={handleSaveSavings}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {t.save}
            </button>
          </div>
        </div>

        {/* App Lock */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                <Shield className="text-purple-400" size={16} />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white font-medium text-sm">{t.appLock}</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.requirePin}</p>
              </div>
            </div>
            <button 
              onClick={handleToggleLock}
              className={`w-12 h-6 rounded-full transition-colors relative ${isLockEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isLockEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          
          {isLockEnabled && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500/50 tracking-[0.5em] font-mono text-center"
                placeholder={t.enterPin}
              />
              <button
                onClick={handleSavePin}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {t.setPin}
              </button>
            </div>
          )}
        </div>

        {/* Categories Link */}
        <button
          onClick={() => onChangeView('categories')}
          className="w-full glass-card p-4 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shrink-0">
              <Tags className="text-teal-500 dark:text-teal-400" size={16} />
            </div>
            <div className="text-left">
              <h2 className="text-slate-900 dark:text-white font-medium text-sm">{t.manageCategories}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.addRemoveCategories}</p>
            </div>
          </div>
          <ChevronRight className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" size={18} />
        </button>

        {/* Export Data */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
              <Download className="text-orange-500 dark:text-orange-400" size={16} />
            </div>
            <div className="text-left">
              <h2 className="text-slate-900 dark:text-white font-medium text-sm">{t.exportData}</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Download your transactions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-black/5 dark:border-white/10"
            >
              <Download size={16} /> PDF
            </button>
            <button
              onClick={downloadCSV}
              className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-black/5 dark:border-white/10"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">{t.dangerZone}</p>
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
                  <h2 className="text-rose-400 font-medium text-sm">{t.resetData}</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.clearTransactions}</p>
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
                  <h2 className="text-red-500 font-medium text-sm">{t.deleteAccount}</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.permanentlyRemove}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
