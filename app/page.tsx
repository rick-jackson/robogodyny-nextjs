'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, User, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EntryModal from '@/components/EntryModal';
import DetailModal from '@/components/DetailModal';
import SettingsModal from '@/components/SettingsModal';
import { WorkEntry, User as AppUser } from '@/types';
import { 
  calculateHours, 
  calculateEarnings, 
  getDayType, 
  getEntriesForMonth, 
  generateDemoEntries,
  formatDate 
} from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function RoboGodynyApp() {
  // State
  const [currentView, setCurrentView] = useState<'calendar' | 'admin'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [users] = useState<AppUser[]>([
    { id: 1, name: "Олександр Коваленко", email: "oleksandr@company.ua", rate: 180, role: "user" },
    { id: 2, name: "Марія Шевченко", email: "maria@company.ua", rate: 165, role: "user" },
    { id: 3, name: "Дмитро Бондаренко", email: "dmytro@company.ua", rate: 195, role: "user" },
  ]);

  // Modal states
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [currentModalDate, setCurrentModalDate] = useState<string>('');
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<WorkEntry | null>(null);
  const [selectedAdminUser, setSelectedAdminUser] = useState<AppUser | null>(null);
  const [adminTab, setAdminTab] = useState<'hours' | 'info'>('hours');

  const supabase = createClient();

  // Load entries from Supabase
  useEffect(() => {
    const loadEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading entries:', error);
        return;
      }

      if (data) {
        setEntries(data as WorkEntry[]);
      }
    };

    loadEntries();
  }, []);

  // Save to localStorage
  const saveEntryToSupabase = async (entryData: any, isEditing: boolean = false, editingId?: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const entry = {
      ...entryData,
      user_id: user.id,
    };

    if (isEditing && editingId) {
      const { error } = await supabase
        .from('work_entries')
        .update(entry)
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating entry:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('work_entries')
        .insert(entry);

      if (error) {
        console.error('Error inserting entry:', error);
        return false;
      }
    }

    // Reload entries
    const { data } = await supabase
      .from('work_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (data) {
      setEntries(data as WorkEntry[]);
    }

    return true;
  };

  // Calculate totals for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthEntries = getEntriesForMonth(entries, year, month);

  let totalHours = 0;
  let totalEarnings = 0;

  monthEntries.forEach(entry => {
    const hours = calculateHours(entry.startTime, entry.endTime, entry.travelTimeMinutes || 0);
    const dayType = getDayType(entry.date);
    totalHours += hours;
    totalEarnings += calculateEarnings(hours, dayType, entry.rateUsed || 180);
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const days: any[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday start

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = 0; i < startOffset; i++) {
      const dayNum = prevMonthDays - startOffset + i + 1;
      days.push({
        day: dayNum,
        dateStr: null,
        isOtherMonth: true,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = entries.find(e => e.date === dateStr);
      
      const today = new Date();
      const isToday = dateStr === today.toISOString().split('T')[0];

      days.push({
        day,
        dateStr,
        isOtherMonth: false,
        entry,
        isToday,
      });
    }

    // Next month padding
    const totalCells = startOffset + daysInMonth;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          day: i,
          dateStr: null,
          isOtherMonth: true,
        });
      }
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Handlers
  const changeMonth = (delta: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
    setSelectedAdminUser(null);
  };

  const showAddModal = (dateStr: string) => {
    setCurrentModalDate(dateStr);
    setEditingEntry(null);
    setShowEntryModal(true);
  };

  const showEditModal = (entry: WorkEntry) => {
    setCurrentModalDate(entry.date);
    setEditingEntry(entry);
    setShowDetailModal(false);
    setShowEntryModal(true);
  };

  const handleSaveEntry = async (entryData: any) => {
    const success = await saveEntryToSupabase(
      entryData, 
      !!editingEntry, 
      editingEntry?.id
    );

    if (success) {
      setShowEntryModal(false);
      setEditingEntry(null);
      showToast(editingEntry ? 'Запис успішно оновлено!' : 'Запис успішно збережено!');
    } else {
      showToast('Помилка збереження запису');
    }
  };

  const showDetail = (entry: WorkEntry) => {
    setDetailEntry(entry);
    setShowDetailModal(true);
  };

  const handleDeleteEntry = async () => {
    if (!detailEntry) return;

    if (confirm('Видалити цей запис?')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('work_entries')
        .delete()
        .eq('id', detailEntry.id)
        .eq('user_id', user.id);

      if (!error) {
        // Reload entries
        const { data } = await supabase
          .from('work_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (data) setEntries(data as WorkEntry[]);

        setShowDetailModal(false);
        setDetailEntry(null);
        showToast('Запис видалено');
      } else {
        showToast('Помилка видалення');
      }
    }
  };

  const handleEditFromDetail = () => {
    if (detailEntry) {
      showEditModal(detailEntry);
    }
  };

  const changeView = (view: 'calendar' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      setSelectedAdminUser(null);
    }
  };

  const showAdminUserDetail = (user: AppUser) => {
    setSelectedAdminUser(user);
    setAdminTab('hours');
  };

  const addDemoData = () => {
  showToast('Тестові дані недоступні при використанні Supabase');
};

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 -translate-x/2 bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-3xl flex items-center gap-x-3 text-sm shadow-xl z-[100]`;
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2400);
  };

  const handleSaveSettings = (settings: any) => {
    // In real app would update user profile
    showToast('Налаштування збережено! Ставка оновлена.');
    // Optionally update all entries rateUsed if needed
  };

  const monthName = currentMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-zinc-950 text-zinc-200 min-h-screen">
      <Navbar 
        currentView={currentView} 
        onChangeView={changeView} 
        onShowSettings={() => setShowSettingsModal(true)} 
      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-6 md:pt-8">
        
        {/* CALENDAR VIEW */}
        {currentView === 'calendar' && (
          <div id="calendar-view">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-y-4 mb-6">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tighter">Календар</h1>
                <p className="text-zinc-400 mt-1 text-sm md:text-base">Облік робочих годин • Січень – Грудень 2026</p>
              </div>

              {/* Totals + Month Navigation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-x-4 lg:gap-x-8">
                {/* Totals */}
                <div className="flex items-center gap-x-4 sm:gap-x-8 bg-zinc-900 border border-zinc-800 rounded-3xl px-5 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
                  <div>
                    <div className="section-header text-[10px] sm:text-xs">ГОДИН ЗА МІСЯЦЬ</div>
                    <div className="metric-value text-emerald-400 text-2xl sm:text-[1.75rem]">{totalHours.toFixed(1)}</div>
                  </div>
                  <div className="h-8 sm:h-9 w-px bg-zinc-700"></div>
                  <div>
                    <div className="section-header text-[10px] sm:text-xs">ЗАРОБІТОК</div>
                    <div className="metric-value text-emerald-400 text-2xl sm:text-[1.75rem]">{totalEarnings.toLocaleString('uk-UA')} ₴</div>
                  </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-3xl p-1 w-full sm:w-auto">
                  <button 
                    onClick={() => changeMonth(-1)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-zinc-800 rounded-2xl transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="px-4 sm:px-6 font-semibold text-base sm:text-xl tracking-tight min-w-[140px] sm:min-w-[180px] text-center">
                    {monthName}
                  </div>
                  <button 
                    onClick={() => changeMonth(1)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-zinc-800 rounded-2xl transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3 sm:p-6 modern-shadow">
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3 mb-3 px-1 sm:px-2">
                {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-zinc-500 py-2">{day}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                {calendarDays.map((dayInfo, index) => {
                  const { day, dateStr, isOtherMonth, entry, isToday } = dayInfo;

                  if (isOtherMonth) {
                    return (
                      <div key={index} className="day-square calendar-day border border-zinc-800 rounded-3xl p-3 flex flex-col opacity-30">
                        <div className="text-xs text-zinc-500">{day}</div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={index}
                      onClick={() => entry ? showDetail(entry) : showAddModal(dateStr)}
                      className={`day-square calendar-day border border-zinc-800 rounded-3xl p-3 flex flex-col cursor-pointer hover:border-zinc-700 ${isToday ? 'today border-emerald-500' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-xl sm:text-2xl font-semibold tracking-tighter">{day}</div>
                        
                        {entry ? (
                          <div className="text-right">
                            <div className="text-[10px] text-zinc-400">{entry.startTime}–{entry.endTime}</div>
                            <div className="font-mono text-sm font-semibold mt-0.5">
                              {calculateHours(entry.startTime, entry.endTime, entry.travelTimeMinutes || 0).toFixed(1)} год
                            </div>
                          </div>
                        ) : (
                          <div className="ml-auto text-emerald-500/70">
                            <Plus className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {entry && (
                        <div className="mt-auto">
                          {(() => {
                            const h = calculateHours(entry.startTime, entry.endTime, entry.travelTimeMinutes || 0);
                            const dt = getDayType(entry.date);
                            let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                            
                            if (h > 12 || dt !== 'weekday') {
                              colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                            } else if (h > 8) {
                              colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                            }

                            return (
                              <div className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-2xl text-xs font-medium border ${colorClass}`}>
                                {entry.workType === 'business_trip' ? 
                                  <span>✈️</span> : <span>🏢</span>
                                }
                                <span>{h.toFixed(1)} год</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {!entry && (
                        <div className="mt-auto text-[10px] text-zinc-500">Додати</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend + Demo button */}
            <div className="flex items-center justify-between mt-4 px-2 text-xs text-zinc-500">
              <div className="flex items-center gap-x-4">
                <div className="flex items-center gap-x-2">
                  <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded"></div>
                  <span>≤ 8 год</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <div className="w-3 h-3 bg-amber-500/20 border border-amber-500 rounded"></div>
                  <span>8–12 год</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <div className="w-3 h-3 bg-rose-500/20 border border-rose-500 rounded"></div>
                  <span>&gt;12 год / вихідні</span>
                </div>
              </div>
              
              <button 
                onClick={addDemoData}
                className="cursor-pointer flex items-center gap-x-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span className="text-xs font-medium">Додати тестові дані</span>
              </button>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {currentView === 'admin' && (
          <div id="admin-view">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-5xl font-semibold tracking-tighter">Адміністратор</h1>
                <p className="text-zinc-400">Управління командою • {users.length} співробітників</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users List */}
              <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold">Співробітники</div>
                  <button 
                    onClick={() => {
                      const name = prompt("Ім'я та прізвище нового користувача:");
                      if (!name) return;
                      alert('У демо-версії створення користувачів тимчасово відключено. Додайте вручну в коді.');
                    }}
                    className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-2xl text-white flex items-center gap-x-2 text-sm font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Новий</span>
                  </button>
                </div>

                <div className="space-y-1 text-sm">
                  {users.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => showAdminUserDetail(user)}
                      className={`px-4 py-3 hover:bg-zinc-800 rounded-2xl cursor-pointer flex items-center justify-between transition-colors ${selectedAdminUser?.id === user.id ? 'bg-zinc-800' : ''}`}
                    >
                      <div className="flex items-center gap-x-3">
                        <div className="w-8 h-8 bg-zinc-700 rounded-2xl flex-shrink-0 overflow-hidden">
                          <img src={`https://i.pravatar.cc/32?img=${user.id + 10}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-[10px] text-zinc-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-xs px-2.5 py-px bg-zinc-800 rounded-full">{user.rate} ₴/г</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Detail Panel */}
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[420px]">
                {!selectedAdminUser ? (
                  <div className="text-center py-16 text-zinc-500">
                    <User className="w-10 h-10 mx-auto mb-4 opacity-40" />
                    <p>Оберіть співробітника зі списку</p>
                  </div>
                ) : (
                  <div>
                    {/* User Header */}
                    <div className="flex items-center gap-x-4 mb-6">
                      <div className="w-14 h-14 bg-zinc-700 rounded-3xl overflow-hidden flex-shrink-0">
                        <img src={`https://i.pravatar.cc/56?img=${selectedAdminUser.id + 10}`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xl tracking-tight">{selectedAdminUser.name}</div>
                        <div className="text-emerald-400 text-sm">{selectedAdminUser.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">СТАВКА</div>
                        <div className="font-mono text-2xl font-semibold text-emerald-400">
                          {selectedAdminUser.rate} <span className="text-xs">₴/г</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-zinc-800 mb-4">
                      <div className="flex gap-x-8 text-sm">
                        <div 
                          onClick={() => setAdminTab('hours')}
                          className={`pb-3 cursor-pointer transition-colors ${adminTab === 'hours' ? 'border-b-2 border-emerald-500 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                          Години за місяць
                        </div>
                        <div 
                          onClick={() => setAdminTab('info')}
                          className={`pb-3 cursor-pointer transition-colors ${adminTab === 'info' ? 'border-b-2 border-emerald-500 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                          Інформація
                        </div>
                      </div>
                    </div>

                    {/* Tab Content */}
                    {adminTab === 'hours' && (
                      <div>
                        <div className="text-xs text-zinc-400 mb-3">ЗАПИСИ ЗА СІЧЕНЬ 2026</div>
                        <div className="max-h-[280px] overflow-auto pr-2 space-y-2 text-sm">
                          {monthEntries.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 text-sm">Немає записів за цей місяць</div>
                          ) : (
                            monthEntries.slice(0, 8).map(entry => {
                              const h = calculateHours(entry.startTime, entry.endTime, entry.travelTimeMinutes || 0);
                              return (
                                <div key={entry.id} className="flex justify-between items-center bg-zinc-950 px-4 py-3 rounded-2xl">
                                  <div>
                                    <div className="font-medium">
                                      {new Date(entry.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className="text-xs text-zinc-500">{entry.startTime} — {entry.endTime}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono">{h.toFixed(1)} год</div>
                                    <div className="text-[10px] text-emerald-400">
                                      {entry.workType === 'business_trip' ? 'Відрядження' : 'На місці'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {adminTab === 'info' && (
                      <div className="space-y-4 text-sm pt-2">
                        <div className="flex justify-between py-1 border-b border-zinc-800">
                          <span className="text-zinc-400">Телефон</span> 
                          <span>+380 67 555 12 34</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-800">
                          <span className="text-zinc-400">Дата народження</span> 
                          <span>12.04.1991</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-zinc-400">Дата реєстрації</span> 
                          <span>15.01.2025</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EntryModal 
        isOpen={showEntryModal}
        onClose={() => {
          setShowEntryModal(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        dateStr={currentModalDate}
      />

      <DetailModal 
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailEntry(null);
        }}
        entry={detailEntry}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteEntry}
      />

      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
