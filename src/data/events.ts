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
  {
    id: 'sporadic_e_opening',
    name: 'Sporadic E Opening',
    description: 'The Es layer is lit up like a Christmas tree! VHF contacts from coast to coast!',
    icon: '⚡',
    effect: { type: 'qps_multiplier', value: 5 },
    duration: 20,
    weight: 7,
    minQps: 5,
    isPositive: true,
  },
  {
    id: 'qso_party_weekend',
    name: 'QSO Party Weekend',
    description: 'The state QSO party is on! Everyone is calling CQ and handing out counties like candy.',
    icon: '🎉',
    effect: { type: 'click_multiplier', value: 2 },
    duration: 45,
    weight: 10,
    minQps: 1,
    isPositive: true,
  },
  {
    id: 'packet_radio_revival',
    name: 'Packet Radio Revival',
    description: 'The local packet radio BBS is back online! A flood of stored-and-forward QSOs arrive at once.',
    icon: '📦',
    effect: { type: 'bonus_qsos', value: 200 },
    duration: 0,
    weight: 10,
    minQps: 1,
    isPositive: true,
  },
  {
    id: 'repeater_kerchunker',
    name: 'Repeater Kerchunker',
    description: 'Some lid keeps keying up and dropping without IDing. The repeater is unusable.',
    icon: '🔇',
    effect: { type: 'click_multiplier', value: 0.3 },
    duration: 10,
    weight: 12,
    minQps: 0.5,
    isPositive: false,
  },
  {
    id: 'arrl_field_day',
    name: 'ARRL Field Day',
    description: 'The biggest on-air event of the year! Every ham in the country is on the air!',
    icon: '🏕️',
    effect: { type: 'qps_multiplier', value: 4 },
    duration: 60,
    weight: 4,
    minQps: 10,
    isPositive: true,
  },
  {
    id: 'pota_pileup',
    name: 'POTA Pileup!',
    description: 'You activated a new park and the pileup is massive!',
    icon: '🌲',
    effect: { type: 'qps_multiplier', value: 3 },
    duration: 25,
    weight: 8,
    minQps: 5,
    isPositive: true,
  },
  {
    id: 'contest_weekend',
    name: 'Contest Weekend',
    description: 'CQ Contest CQ Contest! Every band is packed with stations.',
    icon: '🏆',
    effect: { type: 'qps_multiplier', value: 5 },
    duration: 30,
    weight: 5,
    minQps: 20,
    isPositive: true,
  },
  {
    id: 'dx_expedition_spotted',
    name: 'DXpedition Spotted!',
    description: 'A rare DXpedition just came on the air — everyone is calling!',
    icon: '🏝️',
    effect: { type: 'bonus_qsos', value: 1000 },
    duration: 0,
    weight: 6,
    minQps: 10,
    isPositive: true,
  },
  {
    id: 'antenna_party',
    name: 'Antenna Raising Party',
    description: 'Your ham radio friends came over to help raise your new antenna!',
    icon: '📡',
    effect: { type: 'swr_reduction', value: 2.0 },
    duration: 0,
    weight: 8,
    minQps: 2,
    isPositive: true,
  },
];

// --- Unlicensed name generator (MURS / FRS — no license needed) ---

const FIRST_NAMES = ['Mike', 'Steve', 'Karen', 'Dave', 'Lisa', 'Bob', 'Sarah', 'Jim', 'Pam', 'Tony', 'Rick', 'Jenny', 'Mark', 'Sue', 'Dan', 'Amy', 'Chris', 'Pat', 'Joe', 'Liz', 'Tom', 'Beth', 'Ray', 'Kim', 'Pete'];

const MURS_CHANNELS = ['CH1', 'CH2', 'CH3', 'CH4', 'CH5'];
const FRS_CHANNELS = Array.from({ length: 22 }, (_, i) => `CH${i + 1}`);

export function randomUnlicensedName(): string {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
}

/** Pick a random unlicensed service (MURS or FRS) and channel */
export function randomUnlicensedService(): { service: 'MURS' | 'FRS'; channel: string } {
  if (Math.random() < 0.5) {
    return { service: 'MURS', channel: MURS_CHANNELS[Math.floor(Math.random() * MURS_CHANNELS.length)] };
  }
  return { service: 'FRS', channel: FRS_CHANNELS[Math.floor(Math.random() * FRS_CHANNELS.length)] };
}

// Keep backward-compatible alias
export const randomMursName = randomUnlicensedName;

// --- Callsign generators by license tier ---

const CALLSIGN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomSuffix(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += CALLSIGN_LETTERS[Math.floor(Math.random() * CALLSIGN_LETTERS.length)];
  }
  return s;
}

// US-only prefixes (letter(s) + area digit built separately)
const US_SINGLE_LETTER_PREFIXES = ['W', 'K', 'N'];
const US_TWO_LETTER_PREFIXES = ['WA', 'WB', 'WD', 'KB', 'KD', 'KE', 'KF'];

function randomUsCallsign(): string {
  const digit = Math.floor(Math.random() * 10);
  const suffixLen = 2 + Math.floor(Math.random() * 2); // 2-3 letters
  if (Math.random() < 0.5) {
    // Single-letter prefix: W3ABC, K7QSO, N0XY
    const p = US_SINGLE_LETTER_PREFIXES[Math.floor(Math.random() * US_SINGLE_LETTER_PREFIXES.length)];
    return `${p}${digit}${randomSuffix(suffixLen)}`;
  } else {
    // Two-letter prefix: KD2FMW, WB9ABC
    const p = US_TWO_LETTER_PREFIXES[Math.floor(Math.random() * US_TWO_LETTER_PREFIXES.length)];
    return `${p}${digit}${randomSuffix(suffixLen)}`;
  }
}

// Common DX prefixes (General level) — prefix includes area digit where typical
const COMMON_DX_PREFIXES = [
  'VE3', 'VE7', 'VE2', 'VE4', 'VE5', 'VE6', 'VE1',
  'XE1', 'XE2',
  'G3', 'G4', 'G0', 'M0',
  'DL1', 'DL2', 'DL5', 'DK3',
  'F5', 'F6',
  'JA1', 'JA3', 'JH1', 'JR2',
  'VK2', 'VK3', 'VK4',
];

// Rare/worldwide DX prefixes (Extra level)
const RARE_DX_PREFIXES = [
  'ZL1', 'ZL2',
  'PY1', 'PY2',
  'LU1', 'LU2',
  'CE3',
  'HS1',
  '9V1',
  'A61',
  'ZS6',
  'SV1', 'SV9',
  'UA3', 'UA6',
  'OH2', 'OH6',
  'SM5', 'SM0',
  'OZ1',
  'PA3',
  'ON4',
  'HB9',
  'EA4', 'EA8',
  'I2',
  'HL1',
  'BV2',
  'YB0',
  '4X4',
  '5B4',
  'A7',
  'VP9',
  'V3',
  'TI2',
  'HP1',
];

function randomDxCallsign(prefixes: string[]): string {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffixLen = 2 + Math.floor(Math.random() * 2);
  return `${prefix}${randomSuffix(suffixLen)}`;
}

/** Technician: US-only local/VHF contacts */
export function randomLocalCallsign(): string {
  return randomUsCallsign();
}

/** General: US + common DX (70% US, 30% DX) */
export function randomDomesticDxCallsign(): string {
  if (Math.random() < 0.7) {
    return randomUsCallsign();
  }
  return randomDxCallsign(COMMON_DX_PREFIXES);
}

/** Extra: US + all worldwide DX (50% US, 50% DX) */
export function randomWorldwideCallsign(): string {
  if (Math.random() < 0.5) {
    return randomUsCallsign();
  }
  // Pick from common + rare DX combined
  const allDx = [...COMMON_DX_PREFIXES, ...RARE_DX_PREFIXES];
  return randomDxCallsign(allDx);
}

// Keep backward-compatible export (defaults to worldwide)
export function randomCallsign(): string {
  return randomWorldwideCallsign();
}

export const events = RANDOM_EVENTS;
export const randomEvents = RANDOM_EVENTS;
