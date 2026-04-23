'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from './ToastContext';

interface AutoRefreshProps {
  onRefresh: () => void;
  intervalMinutes?: number;
  enabled?: boolean;
}

const STORAGE_KEY = 'gamescraper-autorefresh';

export function useAutoRefresh({
  onRefresh,
  intervalMinutes = 5,
  enabled: enabledProp = true,
}: AutoRefreshProps) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return enabledProp;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : enabledProp;
    } catch {
      return enabledProp;
    }
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const { showInfo } = useToast();

  const toggleAutoRefresh = useCallback(() => {
    setEnabled((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setTimeout(() => setNextRefresh(null), 0);
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    // Set initial next refresh time
    const now = new Date();
    setTimeout(() => setNextRefresh(new Date(now.getTime() + intervalMs)), 0);

    const doRefresh = () => {
      onRefresh();
      const refreshNow = new Date();
      setLastRefresh(refreshNow);
      setNextRefresh(new Date(refreshNow.getTime() + intervalMs));
      showInfo('Données actualisées automatiquement');
    };

    const interval = setInterval(doRefresh, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMinutes, onRefresh, showInfo]);

  return {
    enabled,
    toggleAutoRefresh,
    lastRefresh,
    nextRefresh,
  };
}

interface AutoRefreshToggleProps {
  enabled: boolean;
  onToggle: () => void;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  intervalMinutes?: number;
}

export function AutoRefreshToggle({
  enabled,
  onToggle,
  lastRefresh,
  nextRefresh,
  intervalMinutes = 5,
}: AutoRefreshToggleProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Auto-refresh</p>
          <p className="text-xs text-blue-200/70">
            Actualisation toutes les {intervalMinutes} min
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`relative h-7 w-13 rounded-full transition-all duration-300 ${
            enabled ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' : 'bg-white/10'
          }`}
          aria-label={enabled ? 'Désactiver auto-refresh' : 'Activer auto-refresh'}
        >
          <span
            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 shadow-md ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {enabled && (
        <div className="flex justify-between text-xs text-blue-200/70 pt-2 border-t border-white/5">
          <span>Dernière: {formatTime(lastRefresh)}</span>
          <span>Prochaine: {formatTime(nextRefresh)}</span>
        </div>
      )}
    </div>
  );
}
