// ============================================================
// Ham Radio Clicker — Type Definitions
// ============================================================

// --- Station (generator) ---

export interface Station {
  id: string;
  name: string;
  description: string;
  flavor: string;
  baseCost: number;
  baseQps: number;
  costMultiplier: number;
  icon: string;
  tier: number;
  unlockAt: number;
  requiredLicense?: string;  // upgrade ID that must be purchased to buy this station
}

// --- Upgrades ---

export type UpgradeType =
  | 'click_multiplier'
  | 'click_flat'
  | 'qps_multiplier'
  | 'station_qps_multiplier'
  | 'swr_drift_reduction'
  | 'swr_visibility'
  | 'auto_tuner'
  | 'temporary_boost';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  flavor: string;
  cost: number;
  type: UpgradeType;
  value: number;
  duration?: number;
  targetStationId?: string;
  icon: string;
  requires?: string;
  tier: number;
  category?: 'radio' | 'antenna' | 'amp' | 'mode' | 'band' | 'event' | 'license' | 'activity' | 'equipment';
}

// --- Achievements ---

export type AchievementCondition =
  | { type: 'total_qsos'; value: number }
  | { type: 'total_clicks'; value: number }
  | { type: 'qps'; value: number }
  | { type: 'swr_above'; value: number }
  | { type: 'finals_blown'; value: number }
  | { type: 'own_all_stations' }
  | { type: 'station_owned'; stationId: string; count: number }
  | { type: 'total_stations'; value: number };

export interface Achievement {
  id: string;
  name: string;
  description: string;
  flavor: string;
  icon: string;
  condition: AchievementCondition;
  hidden: boolean;
}

// --- Random Events ---

export type EventEffect =
  | { type: 'qps_multiplier'; value: number }
  | { type: 'click_multiplier'; value: number }
  | { type: 'no_passive' }
  | { type: 'swr_spike'; value: number }
  | { type: 'swr_reduction'; value: number }
  | { type: 'bonus_qsos'; value: number }
  | { type: 'discount'; value: number }
  | { type: 'combined'; effects: EventEffect[] };

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: EventEffect;
  duration: number;
  weight: number;
  minQps: number;
  requiresStationId?: string;
  isPositive: boolean;
}

export interface ActiveEvent {
  id: string;
  endsAt: number;
  effect: EventEffect;
}

// --- SWR State ---

export interface SWRState {
  current: number;
  baseDrift: number;
  lastTuneTime: number;
  autoTunerInterval: number;
  equipmentDamaged: boolean;
  damageRepairCost: number;
}

// --- Event Log ---

export type EventLogType = 'event' | 'achievement' | 'milestone' | 'warning' | 'qso' | 'purchase' | 'swr' | 'damage';

export interface EventLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: EventLogType;
}

// --- Game State ---

export interface GameState {
  qsos: number;
  totalQsos: number;
  totalClicks: number;
  qsoPerClick: number;
  qsoPerSecond: number;
  clickMultiplier: number;
  swr: SWRState;
  stations: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  activeEvent: ActiveEvent | null;
  eventLog: EventLogEntry[];
  startTime: number;
  discountActive: number;
  maxSwrReached: number;
  finalsBlownCount: number;
  callsign: string;
  transmitPower: number;
  prestigeLevel: number;
  prestigeMultiplier: number;
  qsoQuality: number;
}
