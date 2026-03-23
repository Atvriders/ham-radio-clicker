// ============================================================
// Ham Radio Clicker — Random Event Definitions
// ============================================================

import { RandomEvent } from '../types';

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'solar_flare',
    name: 'Solar Flare!',
    description: 'A massive solar flare supercharges the ionosphere. HF propagation goes wild!',
    icon: '☀️',
    effect: { type: 'qps_multiplier', value: 3 },
    duration: 30,
    weight: 10,
    minQps: 1,
    isPositive: true,
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    description: 'Lightning nearby! Static crashes are off the charts and your SWR is climbing.',
    icon: '⛈️',
    effect: { type: 'swr_spike', value: 3 },
    duration: 25,
    weight: 15,
    minQps: 0.5,
    isPositive: false,
  },
  {
    id: 'neighbor_tvi',
    name: 'Neighbor Complains About TVI',
    description: 'Your neighbor is banging on the door. Their TV looks like a Picasso painting.',
    icon: '📺',
    effect: { type: 'click_multiplier', value: 0.5 },
    duration: 20,
    weight: 15,
    minQps: 2,
    isPositive: false,
  },
  {
    id: 'rare_dx',
    name: 'Rare DX Spotted!',
    description: 'A once-in-a-decade DXpedition is on the air! Pileup frenzy!',
    icon: '🏝️',
    effect: { type: 'bonus_qsos', value: 500 },
    duration: 0,
    weight: 8,
    minQps: 5,
    isPositive: true,
  },
  {
    id: 'antenna_ice',
    name: 'Antenna Icing',
    description: 'Ice is building up on your antenna elements. SWR is drifting up.',
    icon: '🧊',
    effect: { type: 'swr_spike', value: 2 },
    duration: 30,
    weight: 12,
    minQps: 1,
    isPositive: false,
  },
  {
    id: 'six_meter_opening',
    name: '6 Meter Opening!',
    description: 'The Magic Band has opened! Sporadic E propagation across the continent!',
    icon: '🌟',
    effect: { type: 'qps_multiplier', value: 10 },
    duration: 15,
    weight: 5,
    minQps: 10,
    isPositive: true,
  },
  {
    id: 'power_outage',
    name: 'Power Outage',
    description: 'The power just went out. Hope you have a generator... you don\'t, do you?',
    icon: '🔋',
    effect: { type: 'no_passive' },
    duration: 30,
    weight: 10,
    minQps: 5,
    isPositive: false,
  },
  {
    id: 'hamfest_deal',
    name: 'Hamfest Bargain!',
    description: 'You found an amazing deal at the local hamfest flea market. Everything 50% off!',
    icon: '🏷️',
    effect: { type: 'discount', value: 0.5 },
    duration: 45,
    weight: 8,
    minQps: 2,
    isPositive: true,
  },
  {
    id: 'qrm',
    name: 'QRM -- Interference!',
    description: 'A plasma TV three houses down is wiping out the entire HF spectrum. S9+40 noise floor.',
    icon: '📡',
    effect: { type: 'click_multiplier', value: 0.5 },
    duration: 15,
    weight: 15,
    minQps: 1,
    isPositive: false,
  },
  {
    id: 'propagation_blackout',
    name: 'Propagation Blackout',
    description: 'A geomagnetic storm has killed HF propagation. The bands are completely dead.',
    icon: '🌑',
    effect: { type: 'no_passive' },
    duration: 20,
    weight: 8,
    minQps: 10,
    isPositive: false,
  },
];

// --- Callsign generator (kept for UI flavor) ---

export const CALLSIGN_PREFIXES = [
  'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W0',
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K0',
  'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N0',
  'KA', 'KB', 'KC', 'KD', 'KE', 'KF', 'KG',
  'WA', 'WB', 'WD', 'WR',
  'VE1', 'VE2', 'VE3', 'VE4', 'VE5', 'VE6', 'VE7',
  'JA', 'JH', 'JR',
  'G3', 'G4', 'G0', 'M0',
  'DL1', 'DL2', 'DK3',
  'VK2', 'VK3', 'VK4',
  'ZL1', 'ZL2',
  'LU1', 'LU2',
  'PY1', 'PY2',
];

const CALLSIGN_SUFFIXES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function randomCallsign(): string {
  const prefix = CALLSIGN_PREFIXES[Math.floor(Math.random() * CALLSIGN_PREFIXES.length)];
  const len = 2 + Math.floor(Math.random() * 2); // 2-3 suffix chars
  let suffix = '';
  for (let i = 0; i < len; i++) {
    suffix += CALLSIGN_SUFFIXES[Math.floor(Math.random() * CALLSIGN_SUFFIXES.length)];
  }
  return prefix + suffix;
}

export const events = RANDOM_EVENTS;
export const randomEvents = RANDOM_EVENTS;
