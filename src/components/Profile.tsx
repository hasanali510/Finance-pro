import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, User, Briefcase, Mail, Phone, Check } from 'lucide-react';
import { Account, UserSettings } from '../types';
import { THEME_COLORS } from './AccountSelector';
import { ToastMessage } from './Toast';
import { translations } from '../i18n';

interface ProfileProps {
  account: Account;
  onUpdateAccount: (account: Account) => void;
  onBack: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  settings: UserSettings;
}

export function Profile({ account, onUpdateAccount, onBack, addToast, settings }: ProfileProps) {
  const [name, setName] = useState(account.name);
  const [profession, setProfession] = useState(account.profession || '');
  const [email, setEmail] = useState(account.email || '');
  const [mobile, setMobile] = useState(account.mobile || '');
  const [avatar, setAvatar] = useState(account.avatar);
  const [profileImage, setProfileImage] = useState(account.profileImage || '');

  const theme = THEME_COLORS.find(t => t.id === account.themeColor) || THEME_COLORS[0];

  const t = translations[settings.language || 'en'].profile;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }
    onUpdateAccount({
      ...account,
      name,
      profession,
      email,
      mobile,
      avatar: avatar || name.charAt(0).toUpperCase(),
      profileImage
    });
    addToast('Profile updated successfully', 'success');
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner ring-4 ring-black/5 dark:ring-white/10 overflow-hidden ${theme.bg} ${theme.text}`}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              avatar
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <label htmlFor="profile-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </label>
          </div>
          <input 
            id="profile-upload"
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.tapToUpload}</p>
          {!profileImage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{t.orUseEmoji}</span>
              <input 
                type="text" 
                maxLength={2}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                className="w-12 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-center text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 shadow-sm dark:shadow-none"
              />
            </div>
          )}
          {profileImage && (
            <button 
              onClick={() => setProfileImage('')}
              className="text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
            >
              {t.removePhoto}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-card p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <User size={14} /> {t.fullName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white outline-none focus:ring-0 text-base"
            placeholder={t.fullNamePlaceholder}
          />
        </div>

        <div className="glass-card p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <Briefcase size={14} /> {t.profession}
          </label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white outline-none focus:ring-0 text-base"
            placeholder={t.professionPlaceholder}
          />
        </div>

        <div className="glass-card p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <Mail size={14} /> {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white outline-none focus:ring-0 text-base"
            placeholder={t.emailPlaceholder}
          />
        </div>

        <div className="glass-card p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <Phone size={14} /> {t.mobile}
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white outline-none focus:ring-0 text-base"
            placeholder={t.mobilePlaceholder}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Check size={24} strokeWidth={3} /> {t.saveProfile}
      </button>
    </motion.div>
  );
}
