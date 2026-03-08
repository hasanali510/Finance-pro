import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar, Tag, CreditCard, FileText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Category, Transaction, TransactionType, UserSettings } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { format } from 'date-fns';
import { translations } from '../i18n';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  settings: UserSettings;
}

export function AddTransactionModal({ isOpen, onClose, onSave, categories, settings }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setType('expense');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setPaymentMethod(PAYMENT_METHODS[0]?.id || '');
      setNote('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, categoryId]);

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    onSave({
      type,
      amount: Number(amount),
      categoryId,
      date: new Date(date).toISOString(),
      paymentMethod,
      note,
    });
    onClose();
  };

  const t = translations[settings.language || 'en'].addTransaction;
  const tDash = translations[settings.language || 'en'].dashboard;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 glass-panel rounded-t-[40px] z-50 p-6 pb-safe max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl mb-6 relative">
              <motion.div
                className="absolute inset-y-1 rounded-xl shadow-lg"
                initial={false}
                animate={{
                  left: type === 'expense' ? '4px' : '50%',
                  right: type === 'expense' ? '50%' : '4px',
                  backgroundImage: type === 'expense' 
                    ? 'linear-gradient(to right, #F43F5E, #F97316)' 
                    : 'linear-gradient(to right, #10B981, #2DD4BF)'
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              />
              <button
                onClick={() => setType('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors relative z-10 ${
                  type === 'expense' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpCircle size={18} /> {tDash.expense}
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors relative z-10 ${
                  type === 'income' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownCircle size={18} /> {tDash.income}
              </button>
            </div>

            <div className="space-y-6">
              {/* Amount Input */}
              <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className={`pointer-events-none absolute inset-0 opacity-0 group-focus-within:opacity-100 transition-opacity ${
                  type === 'income' ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5' : 'bg-gradient-to-br from-rose-500/10 to-orange-500/5'
                }`} />
                <p className="relative z-10 text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">{t.amount}</p>
                <div className="relative z-10 flex items-center text-5xl font-bold text-slate-900 dark:text-white">
                  <span className={`mr-2 ${type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent border-none outline-none w-full text-center placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 ml-1">
                  <Tag size={16} /> {t.category}
                </label>
                <div className="flex flex-wrap gap-3">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border ${
                        categoryId === cat.id
                          ? 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                          : 'bg-transparent border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={{
                        borderColor: categoryId === cat.id ? cat.color : undefined,
                        color: categoryId === cat.id ? cat.color : undefined,
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 ml-1">
                    <Calendar size={16} /> {t.date}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors shadow-sm dark:shadow-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 ml-1">
                    <CreditCard size={16} /> {t.paymentMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none shadow-sm dark:shadow-none"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 ml-1">
                  <FileText size={16} /> {t.note}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notePlaceholder}
                  className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!amount || Number(amount) <= 0}
                className={`w-full mt-8 text-white font-bold text-lg py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  type === 'income'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-rose-500 to-orange-400 shadow-[0_8px_32px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_32px_rgba(244,63,94,0.5)]'
                }`}
              >
                <Check size={24} strokeWidth={3} /> {t.save} {type === 'income' ? tDash.income : tDash.expense}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
