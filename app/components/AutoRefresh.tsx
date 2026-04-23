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
    <div className="border border-[var(--line-strong)] bg-[var(--bg-card)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-3 hover:bg-[var(--bg-elev)] transition-colors"
        aria-label={enabled ? 'Désactiver auto-refresh' : 'Activer auto-refresh'}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full transition-colors ${
              enabled ? 'bg-[var(--good)] live-dot' : 'bg-[var(--ink-muted)]'
            }`}
          />
          <span className="text-[13px] font-medium text-[var(--ink)]">
            {enabled ? 'Actif' : 'Inactif'}
          </span>
        </div>
        <span
          className={`relative inline-flex h-5 w-9 items-center border ${
            enabled ? 'bg-[var(--brand)] border-[var(--brand)]' : 'bg-transparent border-[var(--line-strong)]'
          }`}
        >
          <span
            className={`inline-block h-[13px] w-[13px] bg-white transition-transform duration-200 ${
              enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
            }`}
          />
        </span>
      </button>
      {enabled && (
        <div className="px-3 py-2 border-t border-[var(--line)] mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-muted)] space-y-1">
          <div className="flex justify-between">
            <span>Last</span>
            <span className="text-[var(--ink-dim)]">{formatTime(lastRefresh)}</span>
          </div>
          <div className="flex justify-between">
            <span>Next</span>
            <span className="text-[var(--ink-dim)]">{formatTime(nextRefresh)}</span>
          </div>
          <div className="flex justify-between">
            <span>Every</span>
            <span className="text-[var(--ink-dim)]">{intervalMinutes}m</span>
          </div>
        </div>
      )}
    </div>
  );
}
