// ============================================================
// Ham Radio Clicker — Game Loop (requestAnimationFrame)
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { achievements as ACHIEVEMENTS } from '../data/achievements';
import { events as RANDOM_EVENTS } from '../data/events';
import { stations } from '../data/stations';
import { AchievementCondition } from '../types';

// ---- Helpers ----

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function checkCondition(
  condition: AchievementCondition,
  state: ReturnType<typeof useGameStore.getState>,
): boolean {
  switch (condition.type) {
    case 'total_qsos':
      return state.totalQsos >= condition.value;
    case 'total_clicks':
      return state.totalClicks >= condition.value;
    case 'qps':
      return state.qsoPerSecond >= condition.value;
    case 'swr_above':
      return state.maxSwrReached >= condition.value;
    case 'finals_blown':
      return state.finalsBlownCount >= condition.value;
    case 'own_all_stations':
      return stations.every((st) => (state.stations[st.id] ?? 0) > 0);
    case 'station_owned':
      return (state.stations[condition.stationId] ?? 0) >= condition.count;
    case 'total_stations': {
      const total = Object.values(state.stations).reduce(
        (sum, n) => sum + n,
        0,
      );
      return total >= condition.value;
    }
    default:
      return false;
  }
}

// ---- The Hook ----

export function useGameLoop(): void {
  const lastFrameRef = useRef<number>(0);
  const lastAchievementCheckRef = useRef<number>(0);
  const nextEventTimeRef = useRef<number>(0);
  const lastSaveRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const scheduleNextEvent = useCallback(() => {
    nextEventTimeRef.current = Date.now() + randomBetween(30_000, 90_000);
  }, []);

  useEffect(() => {
    // Load saved game on mount
    const store = useGameStore.getState();
    store.load();

    // Retroactively unlock achievements after load (delayed for async server fetch)
    setTimeout(() => {
      const current = useGameStore.getState();
      for (const ach of ACHIEVEMENTS) {
        if (current.achievements.includes(ach.id)) continue;
        if (checkCondition(ach.condition, current)) {
          useGameStore.setState((s) => ({
            achievements: [...s.achievements, ach.id],
          }));
        }
      }
    }, 1500);

    const now = Date.now();
    lastFrameRef.current = now;
    lastAchievementCheckRef.current = now;
    lastSaveRef.current = now;
    scheduleNextEvent();

    function loop(timestamp: number) {
      const now = Date.now();
      const deltaMs = Math.min(now - lastFrameRef.current, 200); // Cap at 200ms to prevent spiral
      lastFrameRef.current = now;

      const state = useGameStore.getState();

      // -- Tick (SWR drift, passive production, event expiry) --
      if (deltaMs > 0) {
        state.tick(deltaMs);
      }

      // -- Achievement check (every 1 second) --
      if (now - lastAchievementCheckRef.current >= 1000) {
        lastAchievementCheckRef.current = now;
        const current = useGameStore.getState();

        for (const ach of ACHIEVEMENTS) {
          if (current.achievements.includes(ach.id)) continue;
          if (checkCondition(ach.condition, current)) {
            useGameStore.setState((s) => ({
              achievements: [...s.achievements, ach.id],
              eventLog: [
                {
                  id: `log-${Date.now()}-ach-${ach.id}`,
                  timestamp: Date.now(),
                  message: `Achievement unlocked: ${ach.name} — ${ach.description}`,
                  type: 'achievement' as const,
                },
                ...s.eventLog,
              ].slice(0, 200),
            }));
          }
        }
      }

      // -- Random events (every 30-90 seconds) --
      if (now >= nextEventTimeRef.current) {
        scheduleNextEvent();
        const current = useGameStore.getState();

        // Don't stack events with duration
        if (!current.activeEvent || current.activeEvent.endsAt === 0) {
          // Filter eligible events
          const eligible = RANDOM_EVENTS.filter(
            (e) => current.qsoPerSecond >= e.minQps,
          );

          if (eligible.length > 0) {
            // Weighted random selection
            const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
            let roll = Math.random() * totalWeight;
            let chosen = eligible[0];
            for (const e of eligible) {
              roll -= e.weight;
              if (roll <= 0) {
                chosen = e;
                break;
              }
            }
            current.setEvent(chosen);
          }
        }
      }

      // -- Auto-save (every 30 seconds) --
      if (now - lastSaveRef.current >= 30_000) {
        lastSaveRef.current = now;
        useGameStore.getState().save();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      // Save on unmount
      useGameStore.getState().save();
    };
  }, [scheduleNextEvent]);
}
