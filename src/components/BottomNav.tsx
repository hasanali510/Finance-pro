import { Home, PieChart, List, Settings as SettingsIcon, Plus } from 'lucide-react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onAddClick: () => void;
}

export function BottomNav({ currentView, onChangeView, onAddClick }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'add', icon: Plus, label: 'Add', isAction: true },
    { id: 'history', icon: List, label: 'History' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel pb-safe pt-2 px-6 z-40">
      <div className="flex justify-between items-center max-w-md mx-auto relative pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Highlight settings tab if current view is categories
          const isActive = currentView === item.id || (item.id === 'settings' && currentView === 'categories');

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                className="relative -top-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 text-white shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-transform"
              >
                <Icon size={28} strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className="flex flex-col items-center justify-center w-12 h-12 relative"
            >
              <Icon
                size={22}
                className={`transition-colors duration-300 ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
