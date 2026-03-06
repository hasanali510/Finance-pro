import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Wallet, TrendingUp, Shield } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Smart Income',
      description: 'Your premium personal finance manager.',
      icon: <Wallet size={64} className="text-emerald-400 mb-6" />,
      color: 'bg-emerald-500/10',
    },
    {
      title: 'Track Every Penny',
      description: 'Log your income and expenses with ease and see where your money goes.',
      icon: <TrendingUp size={64} className="text-blue-400 mb-6" />,
      color: 'bg-blue-500/10',
    },
    {
      title: 'Secure & Private',
      description: 'Your data stays on your device. Set a PIN lock for extra security.',
      icon: <Shield size={64} className="text-purple-400 mb-6" />,
      color: 'bg-purple-500/10',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm w-full"
        >
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 ${steps[step].color}`}>
            {steps[step].icon}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{steps[step].title}</h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            {steps[step].description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 left-0 right-0 px-6 flex flex-col items-center gap-8 max-w-md mx-auto">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          {step === steps.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
