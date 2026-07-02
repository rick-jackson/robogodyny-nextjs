'use client';

import { X, Building2, Plane } from 'lucide-react';
import { WorkEntry } from '@/types';
import { useState, useEffect } from 'react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WorkEntry, 'id' | 'createdAt'> & { id?: number }) => void;
  editingEntry?: WorkEntry | null;
  dateStr: string;
}

export default function EntryModal({ isOpen, onClose, onSave, editingEntry, dateStr }: EntryModalProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [workType, setWorkType] = useState<'onsite' | 'business_trip'>('onsite');
  const [location, setLocation] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [hasTravel, setHasTravel] = useState(false);
  const [travelTimeMinutes, setTravelTimeMinutes] = useState(45);
  const [comment, setComment] = useState('');

  // Format date for display
  const formatModalDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  // Populate form when editing
  useEffect(() => {
    if (editingEntry) {
      setStartTime(editingEntry.startTime);
      setEndTime(editingEntry.endTime);
      setWorkType(editingEntry.workType);
      setLocation(editingEntry.location || '');
      setIsDriver(editingEntry.isDriver || false);
      setHasTravel(editingEntry.hasTravel || false);
      setTravelTimeMinutes(editingEntry.travelTimeMinutes || 45);
      setComment(editingEntry.comment || '');
    } else {
      // Reset for new entry
      setStartTime('09:00');
      setEndTime('18:00');
      setWorkType('onsite');
      setLocation('');
      setIsDriver(false);
      setHasTravel(false);
      setTravelTimeMinutes(45);
      setComment('');
    }
  }, [editingEntry, isOpen]);

  const handleSave = () => {
    const entryData = {
      date: dateStr,
      startTime,
      endTime,
      workType,
      location: workType === 'business_trip' ? location : null,
      isDriver: workType === 'business_trip' ? isDriver : false,
      hasTravel: workType === 'business_trip' ? hasTravel : false,
      travelTimeMinutes: workType === 'business_trip' ? travelTimeMinutes : 0,
      comment: comment.trim() || undefined,
      rateUsed: 180,
    };

    onSave(editingEntry ? { ...entryData, id: editingEntry.id } : entryData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="modal bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-2xl tracking-tight">
              {editingEntry ? 'Редагувати запис' : 'Додати запис'}
            </div>
            <div className="text-emerald-400 text-sm font-medium">{formatModalDate(dateStr)}</div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-zinc-400 mb-1.5">ПОЧАТОК РОБОТИ</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="time-input w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 transition-colors rounded-2xl px-4 py-3 text-lg outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-zinc-400 mb-1.5">КІНЕЦЬ РОБОТИ</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="time-input w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 transition-colors rounded-2xl px-4 py-3 text-lg outline-none" 
              />
            </div>
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-zinc-400 mb-2">ТИП РОБОТИ</label>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="work-type" 
                  value="onsite" 
                  checked={workType === 'onsite'} 
                  onChange={() => setWorkType('onsite')}
                  className="peer hidden" 
                />
                <div className={`peer-checked:bg-emerald-500 peer-checked:text-white border transition-all rounded-2xl px-5 py-3 text-center text-sm font-medium flex items-center justify-center gap-x-2 ${
                  workType === 'onsite' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-zinc-700'
                }`}>
                  <Building2 className="w-4 h-4" /> На місці
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="work-type" 
                  value="business_trip" 
                  checked={workType === 'business_trip'} 
                  onChange={() => setWorkType('business_trip')}
                  className="peer hidden" 
                />
                <div className={`peer-checked:bg-emerald-500 peer-checked:text-white border transition-all rounded-2xl px-5 py-3 text-center text-sm font-medium flex items-center justify-center gap-x-2 ${
                  workType === 'business_trip' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-zinc-700'
                }`}>
                  <Plane className="w-4 h-4" /> Відрядження
                </div>
              </label>
            </div>
          </div>

          {/* Business Trip Fields */}
          {workType === 'business_trip' && (
            <div className="space-y-4 border border-zinc-700 bg-zinc-950/50 rounded-2xl p-5">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-zinc-400 mb-1.5">МІСЦЕ ВІДРЯдження</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="м. Київ, офіс партнера"
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-x-3 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    checked={isDriver} 
                    onChange={(e) => setIsDriver(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500" 
                  />
                  <span>Я водій</span>
                </label>

                <label className="flex items-center gap-x-3 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    checked={hasTravel} 
                    onChange={(e) => {
                      setHasTravel(e.target.checked);
                      if (!e.target.checked) setTravelTimeMinutes(0);
                    }}
                    className="w-4 h-4 accent-emerald-500" 
                  />
                  <span>Був доїзд</span>
                </label>
              </div>

              {hasTravel && (
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-400 mb-1.5">ЧАС ДОРОГИ</label>
                  <div className="flex items-center gap-x-3">
                    <input 
                      type="number" 
                      value={travelTimeMinutes} 
                      onChange={(e) => setTravelTimeMinutes(parseInt(e.target.value) || 0)}
                      className="w-24 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm outline-none" 
                    />
                    <span className="text-sm text-zinc-400">хвилин</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-zinc-400 mb-1.5">КОМЕНТАР</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              rows={2} 
              placeholder="Робота з клієнтом, підписання договору..."
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm resize-y outline-none" 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end gap-x-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors rounded-2xl"
          >
            Скасувати
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-[0.985] rounded-2xl text-sm font-semibold flex items-center gap-x-2"
          >
            {editingEntry ? 'Зберегти зміни' : 'Зберегти запис'}
          </button>
        </div>
      </div>
    </div>
  );
}