import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

interface PinLockProps {
  correctPin: string;
  onUnlock: () => void;
}

export function PinLock({ correctPin, onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col items-center justify-center px-6">
      <motion.div
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
          <Lock size={32} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Enter PIN</h1>
        <p className="text-slate-400 mb-12">Please enter your PIN to unlock.</p>

        <div className="flex gap-4 mb-16">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors ${
                pin.length > i ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-700'
              } ${error ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-[280px] w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-20 h-20 rounded-full bg-white/5 text-2xl font-semibold text-white flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePress('0')}
            className="w-20 h-20 rounded-full bg-white/5 text-2xl font-semibold text-white flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-20 h-20 rounded-full bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <Delete size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
