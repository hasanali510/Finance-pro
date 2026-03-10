import { useState } from 'react';
import { Category, TransactionType, ViewState, UserSettings } from '../types';
import { translations } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tags, Check, X, ArrowLeft } from 'lucide-react';

interface CategoriesProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  settings: UserSettings;
}

const COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#64748B'
];

export function Categories({ categories, onAdd, onDelete, onBack, settings }: CategoriesProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const t = translations[settings.language || 'en'].categories;
  const tDash = translations[settings.language || 'en'].dashboard;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({ name: newName.trim(), color: newColor, icon: 'tag', type: activeTab });
    setNewName('');
    setIsAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className={`w-10 h-10 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 ${
            activeTab === 'income' ? 'bg-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_4px_16px_rgba(244,63,94,0.4)]'
          }`}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl mb-6 relative">
        <motion.div
          className="absolute inset-y-1 rounded-xl shadow-lg"
          initial={false}
          animate={{
            left: activeTab === 'expense' ? '4px' : '50%',
            right: activeTab === 'expense' ? '50%' : '4px',
            backgroundImage: activeTab === 'expense' 
              ? 'linear-gradient(to right, #F43F5E, #F97316)' 
              : 'linear-gradient(to right, #10B981, #2DD4BF)'
          }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.15 }}
        />
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 rounded-xl font-medium transition-colors text-sm relative z-10 ${
            activeTab === 'expense' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {tDash.expense}
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 rounded-xl font-medium transition-colors text-sm relative z-10 ${
            activeTab === 'income' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {tDash.income}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 overflow-hidden mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.newCategory} {activeTab === 'income' ? tDash.income : tDash.expense}</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t.categoryName}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors shadow-sm dark:shadow-none"
                autoFocus
              />
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t.color}</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    >
                      {newColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className={`w-full mt-4 text-white font-semibold py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] ${
                  activeTab === 'income' ? 'bg-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_4px_16px_rgba(244,63,94,0.3)]'
                }`}
              >
                {t.saveCategory}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredCategories.map((cat) => (
          <motion.div
            layout
            key={cat.id}
            className="glass-card p-4 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                <Tags size={20} />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-lg">{cat.name}</p>
            </div>
            <button
              onClick={() => onDelete(cat.id)}
              className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 dark:hover:bg-red-500/20"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
