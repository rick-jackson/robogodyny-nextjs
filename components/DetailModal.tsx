'use client';

import { X, Edit, Trash2, Building2, Plane } from 'lucide-react';
import { WorkEntry } from '@/types';
import { calculateHours, calculateEarnings, getDayType, formatDate } from '@/lib/utils';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: WorkEntry | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DetailModal({ isOpen, onClose, entry, onEdit, onDelete }: DetailModalProps) {
  if (!isOpen || !entry) return null;

  const hours = calculateHours(entry.startTime, entry.endTime, entry.travelTimeMinutes || 0);
  const dayType = getDayType(entry.date);
  const earnings = calculateEarnings(hours, dayType, entry.rateUsed);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="modal bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 pt-7 pb-6">
          <div className="font-semibold text-2xl tracking-tight mb-1">{formatDate(entry.date)}</div>
          <div className="text-emerald-400 font-medium text-lg">{entry.startTime} — {entry.endTime}</div>

          <div className="my-6 h-px bg-zinc-800"></div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Відпрацьовано</span>
              <span className="font-semibold text-lg">{hours.toFixed(1)} год</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-zinc-400">Заробіток за день</span>
              <span className="font-semibold text-2xl text-emerald-400">{earnings.toLocaleString('uk-UA')} ₴</span>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-between">
              <span className="text-zinc-400">Тип</span>
              <span className="font-medium flex items-center gap-x-1.5">
                {entry.workType === 'business_trip' ? (
                  <><Plane className="w-4 h-4" /> Відрядження</>
                ) : (
                  <><Building2 className="w-4 h-4" /> На місці</>
                )}
              </span>
            </div>

            {entry.workType === 'business_trip' && entry.location && (
              <div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Місце</span>
                  <span className="font-medium text-right">{entry.location}</span>
                </div>
              </div>
            )}

            {(entry.isDriver || entry.hasTravel) && (
              <div className="text-xs space-y-1 pt-1 text-zinc-300">
                {entry.isDriver && <div><span className="text-zinc-400">Водій:</span> <span className="font-medium">Так</span></div>}
                {entry.hasTravel && <div><span className="text-zinc-400">Доїзд:</span> <span className="font-medium">{entry.travelTimeMinutes || 0} хв</span></div>}
              </div>
            )}

            {entry.comment && (
              <div className="pt-3 border-t border-zinc-800">
                <div className="text-zinc-400 text-xs mb-1">КОМЕНТАР</div>
                <div className="text-sm leading-relaxed">{entry.comment}</div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-x-3">
          <button 
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-x-2 py-3 text-sm font-medium border border-zinc-700 hover:bg-zinc-800 transition-colors rounded-2xl"
          >
            <Edit className="w-4 h-4" />
            <span>Редагувати</span>
          </button>
          <button 
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-x-2 py-3 text-sm font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors rounded-2xl"
          >
            <Trash2 className="w-4 h-4" />
            <span>Видалити</span>
          </button>
        </div>
      </div>
    </div>
  );
}