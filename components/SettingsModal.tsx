'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { rate: number; firstName: string; lastName: string; phone: string; email: string }) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [firstName, setFirstName] = useState('Олександр');
  const [lastName, setLastName] = useState('Коваленко');
  const [phone, setPhone] = useState('+380 67 123 45 67');
  const [email, setEmail] = useState('oleksandr@company.ua');
  const [rate, setRate] = useState(180);

  const handleSave = () => {
    onSave({ rate, firstName, lastName, phone, email });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="modal bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 pt-7 pb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="font-semibold text-2xl tracking-tight">Налаштування профілю</div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">ІМ'Я</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">ПРІЗВИЩЕ</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">ТЕЛЕФОН</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">EMAIL</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm" 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">СТАВКА / ГОД</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={rate} 
                    onChange={(e) => setRate(parseFloat(e.target.value) || 180)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm pr-8" 
                  />
                  <span className="absolute right-4 top-3 text-xs text-zinc-400">₴</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-x-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-2xl hover:bg-zinc-800">Скасувати</button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold rounded-2xl"
          >
            Зберегти зміни
          </button>
        </div>
      </div>
    </div>
  );
}