// ============================================================
// Ham Radio Clicker — Core Game Store (Zustand)
// ============================================================

import { create } from 'zustand';
import {
  GameState,
  EventLogEntry,
  EventLogType,
  ActiveEvent,
  EventEffect,
  RandomEvent,
} from '../types';
import { stations, getStationCost } from '../data/stations';
import { upgrades as UPGRADES } from '../data/upgrades';
import { randomLocalCallsign, randomDomesticDxCallsign, randomWorldwideCallsign, randomUnlicensedName, randomUnlicensedService } from '../data/events';
import { formatNumber } from '../utils/format';

// ---- Constants ----

const SAVE_KEY = 'ham-radio-clicker-save';
const CALLSIGN_KEY = 'ham-radio-clicker-callsign';

// ---- SWR penalty helper ----

export function getSwrPenalty(swr: number, damaged: boolean): number {
  if (damaged) return 0.1;
  if (swr <= 1.5) return 1.0;
  if (swr <= 3.0) return 1.0 - ((swr - 1.5) / 1.5) * 0.3; // linear 1.0 → 0.7
  if (swr <= 5.0) return 0.7 - ((swr - 3.0) / 2.0) * 0.4; // linear 0.7 → 0.3
  // swr > 5.0: rapid drop toward 0
  return Math.max(0.01, 0.3 - ((swr - 5.0) / 5.0) * 0.29);
}

// ---- Initial state ----

const initialState: GameState = {
  qsos: 0,
  totalQsos: 0,
  totalClicks: 0,
  qsoPerClick: 1,
  qsoPerSecond: 0,
  clickMultiplier: 1,
  swr: {
    current: 1.0,
    baseDrift: 0.05,
    lastTuneTime: 0,
    autoTunerInterval: 0,
    equipmentDamaged: false,
    damageRepairCost: 100,
  },
  stations: {},
  upgrades: [],
  achievements: [],
  activeEvent: null,
  eventLog: [],
  startTime: Date.now(),
  discountActive: 0,
  maxSwrReached: 1.0,
  finalsBlownCount: 0,
  callsign: '',
  transmitPower: 5,
  prestigeLevel: 0,
  prestigeMultiplier: 1,
};

// ---- Store actions interface ----

interface GameActions {
  click: () => void;
  tick: (deltaMs: number) => void;
  buyStation: (id: string) => void;
  buyUpgrade: (id: string) => void;
  tuneSwr: () => void;
  repairEquipment: () => void;
  useEventBooster: (id: string) => void;
  setEvent: (event: RandomEvent) => void;
  clearEvent: () => void;
  addLogEntry: (message: string, type: EventLogType) => void;
  clearEventLog: () => void;
  recalcQps: () => void;
  getPrestigeCost: () => number;
  prestige: () => void;
  save: () => void;
  load: () => void;
  reset: () => void;
}

export type GameStore = GameState & GameActions;

// ---- Helpers ----

let logIdCounter = 0;
function makeLogEntry(message: string, type: EventLogType): EventLogEntry {
  return {
    id: `log-${Date.now()}-${logIdCounter++}`,
    timestamp: Date.now(),
    message,
    type,
  };
}

/** Apply a single immediate effect (swr_spike, swr_reduction, bonus_qsos, discount). */
function applyImmediateEffect(
  effect: EventEffect,
  state: GameState,
): Partial<GameState> {
  const patch: Partial<GameState> = {};

  switch (effect.type) {
    case 'swr_spike':
      patch.swr = { ...state.swr, current: state.swr.current + effect.value };
      break;
    case 'swr_reduction':
      patch.swr = {
        ...state.swr,
        current: Math.max(1.0, state.swr.current - effect.value),
      };
      break;
    case 'bonus_qsos':
      patch.qsos = state.qsos + effect.value;
      patch.totalQsos = state.totalQsos + effect.value;
      break;
    case 'discount':
      patch.discountActive = effect.value;
      break;
    case 'combined':
      // Recursively apply each sub-effect
      let merged: Partial<GameState> = {};
      for (const sub of effect.effects) {
        const subPatch = applyImmediateEffect(sub, { ...state, ...merged });
        merged = { ...merged, ...subPatch };
      }
      return merged;
    default:
      break;
  }
  return patch;
}

/** Get the effective QPS multiplier and no_passive flag from the active event. */
function getEventModifiers(event: ActiveEvent | null): {
  qpsMult: number;
  clickMult: number;
  noPassive: boolean;
} {
  const result = { qpsMult: 1, clickMult: 1, noPassive: false };
  if (!event) return result;

  const apply = (eff: EventEffect) => {
    switch (eff.type) {
      case 'qps_multiplier':
        result.qpsMult *= eff.value;
        break;
      case 'click_multiplier':
        result.clickMult *= eff.value;
        break;
      case 'no_passive':
        result.noPassive = true;
        break;
      case 'combined':
        for (const sub of eff.effects) apply(sub);
        break;
      default:
        break;
    }
  };
  apply(event.effect);
  return result;
}

// ---- Recalculate QPS from owned stations + upgrades ----

function calcQps(
  ownedStations: Record<string, number>,
  ownedUpgrades: string[],
): number {
  let totalQps = 0;

  // Per-station multipliers from station_qps_multiplier upgrades
  const stationMults: Record<string, number> = {};
  // Global QPS multiplier from qps_multiplier upgrades
  let globalMult = 1;

  for (const uid of ownedUpgrades) {
    const upg = UPGRADES.find((u) => u.id === uid);
    if (!upg) continue;
    if (upg.type === 'station_qps_multiplier' && upg.targetStationId) {
      stationMults[upg.targetStationId] =
        (stationMults[upg.targetStationId] ?? 1) * upg.value;
    } else if (upg.type === 'qps_multiplier') {
      globalMult *= upg.value;
    }
  }

  for (const st of stations) {
    const count = ownedStations[st.id] ?? 0;
    if (count === 0) continue;
    const mult = stationMults[st.id] ?? 1;
    totalQps += st.baseQps * count * mult;
  }

  return totalQps * globalMult;
}

function calcQsoPerClick(ownedUpgrades: string[]): {
  flat: number;
  mult: number;
} {
  let flat = 1; // base 1
  let mult = 1;
  for (const uid of ownedUpgrades) {
    const upg = UPGRADES.find((u) => u.id === uid);
    if (!upg) continue;
    if (upg.type === 'click_flat') flat += upg.value;
    if (upg.type === 'click_multiplier') mult *= upg.value;
  }
  return { flat, mult };
}

// ---- The Store ----

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // --- Click ---
  click: () => {
    set((s) => {
      const penalty = getSwrPenalty(s.swr.current, s.swr.equipmentDamaged);
      const eventMods = getEventModifiers(s.activeEvent);
      const gained =
        s.qsoPerClick * s.clickMultiplier * eventMods.clickMult * penalty * s.prestigeMultiplier;
      const hasTech = s.upgrades.includes('technician_license');
      const hasGeneral = s.upgrades.includes('general_license');
      const hasExtra = s.upgrades.includes('extra_class_license');

      // Pick random item from array
      const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

      // Weighted random selection
      const weightedPick = (options: [string, number][]): string => {
        const total = options.reduce((sum, [, w]) => sum + w, 0);
        let r = Math.random() * total;
        for (const [val, w] of options) {
          r -= w;
          if (r <= 0) return val;
        }
        return options[0][0];
      };

      // Power category tag
      const pwr = s.transmitPower ?? 5;
      const pwrTag = pwr <= 5 ? 'QRP' : pwr <= 100 ? 'LP' : 'HP';

      let contactLabel: string;
      if (!hasTech) {
        // MURS/FRS — no license
        const svc = randomUnlicensedService();
        contactLabel = `[${svc.service} ${svc.channel} ${pwrTag}] Contact with ${randomUnlicensedName()} (+${gained.toFixed(1)})`;
      } else if (!hasGeneral) {
        // Technician — VHF only
        const band = pick(['2m', '70cm', '6m']);
        const mode = weightedPick([['FM', 70], ['SSB', 20], ['FT8', 10]]);
        contactLabel = `[${band} ${mode} ${pwrTag}] VHF QSO with ${randomLocalCallsign()} (+${gained.toFixed(1)})`;
      } else if (!hasExtra) {
        // General — VHF + HF
        const band = pick(['2m', '70cm', '6m', '20m', '40m', '15m', '10m', '80m']);
        const isVhf = ['2m', '70cm', '6m'].includes(band);
        const mode = isVhf
          ? weightedPick([['FM', 70], ['SSB', 20], ['FT8', 10]])
          : weightedPick([['FT8', 60], ['SSB', 20], ['CW', 10], ['FT4', 10]]);
        const callFn = isVhf ? randomLocalCallsign : randomDomesticDxCallsign;
        contactLabel = `[${band} ${mode} ${pwrTag}] QSO with ${callFn()} (+${gained.toFixed(1)})`;
      } else {
        // Extra — all bands
        const band = pick(['2m', '70cm', '6m', '20m', '40m', '15m', '10m', '80m', '160m', '30m', '17m', '12m', '60m']);
        const isVhf = ['2m', '70cm', '6m'].includes(band);
        const mode = isVhf
          ? weightedPick([['FM', 70], ['SSB', 20], ['FT8', 10]])
          : weightedPick([['FT8', 60], ['SSB', 20], ['CW', 10], ['FT4', 10]]);
        const callFn = isVhf ? randomLocalCallsign : randomWorldwideCallsign;
        contactLabel = `[${band} ${mode} ${pwrTag}] DX QSO with ${callFn()} (+${gained.toFixed(1)})`;
      }
      const newLog = [
        makeLogEntry(contactLabel, 'milestone'),
        ...s.eventLog,
      ].slice(0, 200);

      return {
        qsos: s.qsos + gained,
        totalQsos: s.totalQsos + gained,
        totalClicks: s.totalClicks + 1,
        eventLog: newLog,
      };
    });
  },

  // --- Tick (game loop) ---
  tick: (deltaMs: number) => {
    set((s) => {
      const deltaSec = deltaMs / 1000;
      const now = Date.now();
      const patch: Partial<GameState> = {};

      // -- SWR drift --
      let swr = { ...s.swr };
      if (!swr.equipmentDamaged) {
        // Drift calculation: baseDrift per second, random direction biased upward
        const driftReduction = s.upgrades.reduce((acc, uid) => {
          const u = UPGRADES.find((up) => up.id === uid);
          return u?.type === 'swr_drift_reduction' ? acc + u.value : acc;
        }, 0);
        const effectiveDrift = swr.baseDrift * (1 - Math.min(driftReduction, 0.9));
        const driftAmount = effectiveDrift * deltaSec;
        // Bias upward: 60% chance to go up, 40% down
        const direction = Math.random() < 0.6 ? 1 : -1;
        swr.current = Math.max(1.0, swr.current + driftAmount * direction);
      }

      // -- Auto-tuner --
      if (
        swr.autoTunerInterval > 0 &&
        now - swr.lastTuneTime >= swr.autoTunerInterval
      ) {
        swr.current = Math.max(1.0, swr.current - 3.0);
        swr.lastTuneTime = now;
      }

      // -- SWR damage checks --
      if (swr.current > 10.0 && !swr.equipmentDamaged) {
        swr.equipmentDamaged = true;
        patch.finalsBlownCount = (s.finalsBlownCount ?? 0) + 1;
        patch.eventLog = [
          makeLogEntry(
            'Equipment DAMAGED! SWR exceeded 10.0 — finals blown!',
            'warning',
          ),
          ...s.eventLog,
        ].slice(0, 200);
      } else if (
        swr.current > 5.0 &&
        !swr.equipmentDamaged &&
        Math.random() < 0.01 * deltaSec
      ) {
        swr.equipmentDamaged = true;
        patch.finalsBlownCount = (s.finalsBlownCount ?? 0) + 1;
        patch.eventLog = [
          makeLogEntry(
            'Equipment DAMAGED! High SWR caused finals to blow!',
            'warning',
          ),
          ...(patch.eventLog ?? s.eventLog),
        ].slice(0, 200);
      }

      // Track max SWR
      if (swr.current > s.maxSwrReached) {
        patch.maxSwrReached = swr.current;
      }

      patch.swr = swr;

      // -- Event expiry --
      let activeEvent = s.activeEvent;
      if (activeEvent && activeEvent.endsAt > 0 && now >= activeEvent.endsAt) {
        activeEvent = null;
        patch.discountActive = 0;
      }
      patch.activeEvent = activeEvent;

      // -- Passive QSO production --
      const eventMods = getEventModifiers(activeEvent);
      if (!eventMods.noPassive && s.qsoPerSecond > 0) {
        const penalty = getSwrPenalty(swr.current, swr.equipmentDamaged);
        const gained = s.qsoPerSecond * deltaSec * eventMods.qpsMult * penalty * s.prestigeMultiplier;
        patch.qsos = (patch.qsos ?? s.qsos) + gained;
        patch.totalQsos = (patch.totalQsos ?? s.totalQsos) + gained;
      }

      return patch;
    });
  },

  // --- Buy Station ---
  buyStation: (id: string) => {
    const s = get();
    const station = stations.find((st) => st.id === id);
    if (!station) return;

    // Check license requirement
    if (station.requiredLicense && !s.upgrades.includes(station.requiredLicense)) return;

    const owned = s.stations[id] ?? 0;
    let cost = getStationCost(station, owned);
    if (s.discountActive) cost = Math.floor(cost * (1 - s.discountActive));
    if (s.qsos < cost) return;

    const newStations = { ...s.stations, [id]: owned + 1 };
    const newQps = calcQps(newStations, s.upgrades);

    set({
      qsos: s.qsos - cost,
      stations: newStations,
      qsoPerSecond: newQps,
    });
  },

  // --- Buy Upgrade ---
  buyUpgrade: (id: string) => {
    const s = get();
    if (s.upgrades.includes(id)) return;

    const upgrade = UPGRADES.find((u) => u.id === id);
    if (!upgrade) return;

    // Check prerequisite
    if (upgrade.requires && !s.upgrades.includes(upgrade.requires)) return;

    // Power upgrades have NO license gate — Technicians can run 1500W on VHF/UHF per FCC rules.
    // The LICENSE controls which BANDS you can use, not how much power you can run.

    let cost = upgrade.cost;
    if (s.discountActive) cost = Math.floor(cost * (1 - s.discountActive));
    if (s.qsos < cost) return;

    const newUpgrades = [...s.upgrades, id];
    const newQps = calcQps(s.stations, newUpgrades);
    const clickCalc = calcQsoPerClick(newUpgrades);

    const patch: Partial<GameState> = {
      qsos: s.qsos - cost,
      upgrades: newUpgrades,
      qsoPerSecond: newQps,
      qsoPerClick: clickCalc.flat,
      clickMultiplier: clickCalc.mult,
    };

    // Handle auto-tuner upgrades (data stores interval in seconds, convert to ms)
    if (upgrade.type === 'auto_tuner') {
      patch.swr = { ...s.swr, autoTunerInterval: upgrade.value * 1000 };
    }

    // Handle power upgrades — update transmitPower to the watt value
    const powerMatch = id.match(/^power_(\d+)w$/);
    if (powerMatch) {
      patch.transmitPower = parseInt(powerMatch[1], 10);
    }

    // When getting licensed, clear old MURS entries from log
    if (id === 'technician_license') {
      patch.eventLog = s.eventLog.filter(e => !e.message.includes('[MURS') && !e.message.includes('[FRS'));
    }

    set(patch);
  },

  // --- Tune SWR ---
  tuneSwr: () => {
    set((s) => ({
      swr: {
        ...s.swr,
        current: Math.max(1.0, s.swr.current - 3.0),
        lastTuneTime: Date.now(),
      },
    }));
  },

  // --- Repair Equipment ---
  repairEquipment: () => {
    const s = get();
    if (!s.swr.equipmentDamaged) return;
    if (s.qsos < s.swr.damageRepairCost) return;

    set({
      qsos: s.qsos - s.swr.damageRepairCost,
      swr: {
        ...s.swr,
        equipmentDamaged: false,
        current: Math.min(s.swr.current, 3.0), // Reset SWR to reasonable level on repair
      },
    });
  },

  // --- Event Booster (re-purchasable shop items) ---
  useEventBooster: (id: string) => {
    const s = get();
    const upgrade = UPGRADES.find((u) => u.id === id);
    if (!upgrade || upgrade.type !== 'temporary_boost') return;
    if (s.qsos < upgrade.cost) return;

    const patch: Partial<GameState> = {
      qsos: s.qsos - upgrade.cost,
    };

    if (upgrade.duration && upgrade.duration > 0) {
      // Timed boost — create an ActiveEvent with qps_multiplier
      const now = Date.now();
      const endsAt = now + upgrade.duration * 1000;
      patch.activeEvent = {
        id: upgrade.id,
        endsAt,
        effect: { type: 'qps_multiplier', value: upgrade.value },
      };
      patch.eventLog = [
        makeLogEntry(
          `${upgrade.icon} ${upgrade.name} activated! x${upgrade.value} QPS for ${upgrade.duration}s`,
          'event',
        ),
        ...s.eventLog,
      ].slice(0, 200);
    } else {
      // Instant boost — add QSOs directly
      patch.qsos = (patch.qsos ?? s.qsos) + upgrade.value;
      patch.totalQsos = s.totalQsos + upgrade.value;
      patch.eventLog = [
        makeLogEntry(
          `${upgrade.icon} ${upgrade.name} used! +${formatNumber(upgrade.value)} QSOs`,
          'event',
        ),
        ...s.eventLog,
      ].slice(0, 200);
    }

    set(patch);
  },

  // --- Events ---
  setEvent: (event: RandomEvent) => {
    const s = get();
    const now = Date.now();
    const durationMs = event.duration * 1000;
    const endsAt = durationMs > 0 ? now + durationMs : 0;

    const activeEvent: ActiveEvent = {
      id: event.id,
      endsAt,
      effect: event.effect,
    };

    // Apply immediate effects (swr_spike, swr_reduction, bonus_qsos, discount)
    const immediatePatch = applyImmediateEffect(event.effect, s);

    set({
      ...immediatePatch,
      activeEvent: durationMs > 0 ? activeEvent : s.activeEvent,
      eventLog: [
        makeLogEntry(`${event.icon} ${event.name}: ${event.description}`, 'event'),
        ...s.eventLog,
      ].slice(0, 200),
    });
  },

  clearEvent: () => {
    set({ activeEvent: null, discountActive: 0 });
  },

  // --- Log ---
  addLogEntry: (message: string, type: EventLogType) => {
    set((s) => ({
      eventLog: [makeLogEntry(message, type), ...s.eventLog].slice(0, 200),
    }));
  },

  clearEventLog: () => {
    set({ eventLog: [] });
  },

  // --- Recalc QPS ---
  recalcQps: () => {
    const s = get();
    const newQps = calcQps(s.stations, s.upgrades);
    const clickCalc = calcQsoPerClick(s.upgrades);
    set({
      qsoPerSecond: newQps,
      qsoPerClick: clickCalc.flat,
      clickMultiplier: clickCalc.mult,
    });
  },

  // --- Prestige ---
  getPrestigeCost: () => {
    const s = get();
    return 100 * Math.pow(2, s.prestigeLevel);
  },

  prestige: () => {
    const s = get();
    const cost = 100 * Math.pow(2, s.prestigeLevel);
    if (s.totalQsos < cost) return;

    const newLevel = s.prestigeLevel + 1;
    const newMultiplier = 1 + (newLevel * 0.5);

    // Keep: licenses, achievements, totalQsos, prestige stats, callsign
    const keptUpgrades = s.upgrades.filter((id) =>
      id === 'technician_license' ||
      id === 'general_license' ||
      id === 'extra_class_license'
    );

    // Recalc click stats from kept upgrades only
    const clickCalc = calcQsoPerClick(keptUpgrades);
    const newQps = calcQps({}, keptUpgrades);

    set({
      qsos: 0,
      stations: {},
      upgrades: keptUpgrades,
      qsoPerSecond: newQps,
      qsoPerClick: clickCalc.flat,
      clickMultiplier: clickCalc.mult,
      swr: {
        current: 1.0,
        baseDrift: 0.05,
        lastTuneTime: 0,
        autoTunerInterval: 0,
        equipmentDamaged: false,
        damageRepairCost: 100,
      },
      activeEvent: null,
      discountActive: 0,
      maxSwrReached: 1.0,
      finalsBlownCount: 0,
      transmitPower: 5,
      prestigeLevel: newLevel,
      prestigeMultiplier: newMultiplier,
      eventLog: [
        makeLogEntry(`⭐ PRESTIGE LEVEL ${newLevel}! All QSO earnings now ${newMultiplier}x!`, 'milestone'),
      ],
    });
  },

  // --- Save / Load / Reset ---
  save: () => {
    const s = get();
    const callsign = localStorage.getItem(CALLSIGN_KEY) || s.callsign;
    const saveData: GameState = {
      qsos: s.qsos,
      totalQsos: s.totalQsos,
      totalClicks: s.totalClicks,
      qsoPerClick: s.qsoPerClick,
      qsoPerSecond: s.qsoPerSecond,
      clickMultiplier: s.clickMultiplier,
      swr: s.swr,
      stations: s.stations,
      upgrades: s.upgrades,
      achievements: s.achievements,
      activeEvent: s.activeEvent,
      eventLog: s.eventLog.slice(-50), // Save most recent 50 entries
      startTime: s.startTime,
      discountActive: s.discountActive,
      maxSwrReached: s.maxSwrReached,
      finalsBlownCount: s.finalsBlownCount,
      callsign: callsign,
      transmitPower: s.transmitPower,
      prestigeLevel: s.prestigeLevel,
      prestigeMultiplier: s.prestigeMultiplier,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch {
      // Storage full or unavailable
    }

    // Sync to server if logged in
    if (callsign) {
      const stationsOwned = Object.values(s.stations).reduce((sum, n) => sum + n, 0);
      // Determine license class from upgrades
      let licenseClass = 'Unlicensed';
      if (s.upgrades.includes('extra_class_license')) licenseClass = 'Extra';
      else if (s.upgrades.includes('general_license')) licenseClass = 'General';
      else if (s.upgrades.includes('technician_license')) licenseClass = 'Technician';

      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callsign, saveData }),
      }).catch(() => {});

      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callsign,
          totalQsos: s.totalQsos,
          qsoPerSecond: s.qsoPerSecond,
          stationsOwned,
          achievementsCount: s.achievements.length,
          licenseClass,
        }),
      }).catch(() => {});
    }
  },

  load: () => {
    const callsign = localStorage.getItem(CALLSIGN_KEY);

    // Try server first if logged in
    if (callsign) {
      fetch(`/api/save?callsign=${encodeURIComponent(callsign)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((result) => {
          if (result?.saveData) {
            const data = result.saveData as Partial<GameState>;
            set({ ...initialState, ...data, callsign });
            get().recalcQps();
            return;
          }
          // No server save — fall back to localStorage
          loadFromLocalStorage();
        })
        .catch(() => {
          // Server unavailable — fall back to localStorage
          loadFromLocalStorage();
        });
    } else {
      loadFromLocalStorage();
    }

    function loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
          // No save — reset to fresh state
          set({ ...initialState, callsign: callsign || '', startTime: Date.now() });
          return;
        }
        const data = JSON.parse(raw) as Partial<GameState>;
        set({ ...initialState, ...data, callsign: callsign || '' });
        get().recalcQps();
      } catch {
        // Corrupted save — reset to fresh state
        set({ ...initialState, callsign: callsign || '', startTime: Date.now() });
      }
    }
  },

  reset: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ ...initialState, startTime: Date.now() });
  },
}));
