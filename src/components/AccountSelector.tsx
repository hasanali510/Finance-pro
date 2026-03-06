import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AccountSelectorProps {
  accounts: Account[];
  onSelect: (id: string) => void;
  onCreate: (account: Account) => void;
}

export const THEME_COLORS = [
  { id: 'emerald', hex: '#10B981', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  { id: 'blue', hex: '#3B82F6', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { id: 'purple', hex: '#8B5CF6', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  { id: 'rose', hex: '#F43F5E', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  { id: 'orange', hex: '#F97316', bg: 'bg-orange-500/20', text: 'text-orange-400' },
];

export function AccountSelector({ accounts, onSelect, onCreate }: AccountSelectorProps) {
  const [isCreating, setIsCreating] = useState(accounts.length === 0);
  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].id);

  const handleCreate = () => {
    if (!name.trim()) return;
    const newAccount: Account = {
      id: uuidv4(),
      name: name.trim(),
      avatar: name.trim().substring(0, 2).toUpperCase(),
      themeColor,
      createdAt: new Date().toISOString(),
    };
    onCreate(newAccount);
    setIsCreating(false);
    setName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#0B1120] text-slate-50 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.3)] rotate-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Finance Pro</h1>
          <p className="text-slate-400">Manage your personal finances</p>
        </div>

        {isCreating ? (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Create Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Account Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Personal, Business"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setThemeColor(color.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${themeColor === color.id ? 'scale-110 ring-2 ring-white/50' : ''}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                Create Account <ArrowRight size={18} />
              </button>
              {accounts.length > 0 && (
                <button
                  onClick={() => setIsCreating(false)}
                  className="w-full mt-3 text-slate-400 hover:text-white py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 px-2">Select Account</h2>
            {accounts.map(account => {
              const theme = THEME_COLORS.find(t => t.id === account.themeColor) || THEME_COLORS[0];
              return (
                <button
                  key={account.id}
                  onClick={() => onSelect(account.id)}
                  className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner ${theme.bg} ${theme.text}`}>
                      {account.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-lg">{account.name}</p>
                      <p className="text-xs text-slate-400">Personal Account</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
                </button>
              );
            })}
            <button
              onClick={() => setIsCreating(true)}
              className="w-full glass-card p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-dashed border-2 border-white/10"
            >
              <Plus size={20} /> Add New Account
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
