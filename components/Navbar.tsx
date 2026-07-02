'use client';

import { User, Shield, Settings } from 'lucide-react';

interface NavbarProps {
  currentUser: 'user' | 'admin';
  onSwitchUser: (type: 'user' | 'admin') => void;
  onShowSettings: () => void;
}

export default function Navbar({ currentUser, onSwitchUser, onShowSettings }: NavbarProps) {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-900">
      <div className="max-w-screen-2xl mx-auto">
        <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-3xl">🕒</span>
            </div>
            <div>
              <span className="font-display text-3xl font-semibold tracking-tighter">РобоГодини</span>
            </div>
          </div>
          
          <div className="flex items-center gap-x-4">
            {/* User Switcher */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-3xl p-1">
              <button 
                onClick={() => onSwitchUser('user')}
                className={`px-3 md:px-5 py-1.5 text-sm font-medium rounded-3xl flex items-center gap-x-1.5 md:gap-x-2 transition-colors ${
                  currentUser === 'user' 
                    ? 'bg-emerald-500 text-white' 
                    : 'hover:bg-zinc-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Олександр</span>
              </button>
              <button 
                onClick={() => onSwitchUser('admin')}
                className={`px-3 md:px-5 py-1.5 text-sm font-medium rounded-3xl flex items-center gap-x-1.5 md:gap-x-2 transition-colors ${
                  currentUser === 'admin' 
                    ? 'bg-emerald-500 text-white' 
                    : 'hover:bg-zinc-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Адмін</span>
              </button>
            </div>
            
            <div className="flex items-center gap-x-2">
              <button 
                onClick={onShowSettings}
                className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors rounded-2xl border border-zinc-800"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Налаштування</span>
              </button>
              
              <div className="w-9 h-9 bg-zinc-700 rounded-2xl flex items-center justify-center overflow-hidden ring-2 ring-zinc-800">
                <img src="https://i.pravatar.cc/36?img=68" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}