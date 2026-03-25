// ============================================================
// Ham Radio Clicker -- Shop (Right Sidebar - License-Gated Tabs)
// ============================================================

import React, { useState, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { stations, getStationCost } from '../data/stations';
import { upgrades, UPGRADES } from '../data/upgrades';
import { formatNumber } from '../utils/format';
import Achievements from './Achievements';
import ResearchPanel from './ResearchPanel';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
  red: '#ff4444',
  panel: 'rgba(8,16,24,0.95)',
  border: 'rgba(51,255,51,0.2)',
};

type ShopTab = 'LICENSE' | 'RADIOS' | 'ANTENNAS' | 'AMPS' | 'MODES' | 'BANDS' | 'GEAR' | 'ACTIVITIES' | 'EVENTS' | 'AWARDS' | 'RESEARCH' | 'PRESTIGE';

const ALL_TAB_DEFS: { key: ShopTab; label: string }[] = [
  { key: 'LICENSE', label: '\u{1F4DC} LIC' },
  { key: 'RADIOS', label: 'RIGS' },
  { key: 'ANTENNAS', label: 'ANT' },
  { key: 'AMPS', label: 'AMP' },
  { key: 'MODES', label: 'MODE' },
  { key: 'BANDS', label: 'BAND' },
  { key: 'GEAR', label: 'GEAR' },
  { key: 'ACTIVITIES', label: 'ACT' },
  { key: 'EVENTS', label: 'EVT' },
  { key: 'AWARDS', label: 'AWD' },
  { key: 'RESEARCH', label: 'RSCH' },
  { key: 'PRESTIGE', label: 'PRST' },
];

// IDs of gear items that make sense without a license (receive-only / no-transmit)
const UNLICENSED_GEAR_IDS = new Set([
  'matchbox_radio', 'tin_can_antenna', 'diy_dummy_load',
  'dummy_load', 'antenna_analyzer', 'better_coax',
]);

// IDs of antennas that can be used receive-only (no license needed)
const UNLICENSED_ANTENNA_IDS = new Set([
  'wire_random', 'rubber_duck_antenna',
]);

// Event items that don't require transmitting
const UNLICENSED_EVENT_IDS = new Set(['coffee_boost']);

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '10px 12px',
    fontFamily: 'monospace',
    color: COLORS.green,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 6,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.4)',
    letterSpacing: 1,
  },
  tabRow: {
    display: 'grid',
    gap: 2,
    marginBottom: 6,
    flexShrink: 0,
  },
  tab: {
    padding: '4px 2px',
    textAlign: 'center' as const,
    fontSize: 8,
    letterSpacing: 0.5,
    cursor: 'pointer',
    border: '1px solid rgba(51,255,51,0.3)',
    background: 'rgba(8,16,24,0.9)',
    color: 'rgba(51,255,51,0.4)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
    borderRadius: '2px',
    lineHeight: 1.2,
  },
  tabActive: {
    background: '#33ff33',
    color: '#0a0e1a',
    border: '1px solid #33ff33',
    boxShadow: 'none',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    minHeight: 0,
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    padding: '8px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  },
  cardAffordable: {
    borderColor: 'rgba(51,255,51,0.35)',
    background: 'rgba(51,255,51,0.03)',
  },
  cardDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  cardLocked: {
    opacity: 0.3,
    cursor: 'not-allowed',
    borderColor: 'rgba(255,68,68,0.2)',
    background: 'rgba(255,68,68,0.02)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  cardIcon: {
    fontSize: 14,
  },
  cardName: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  cardCount: {
    fontSize: 10,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  cardFlavor: {
    fontSize: 9,
    color: COLORS.amber,
    opacity: 0.6,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cardCost: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: 'bold',
    textShadow: '0 0 4px rgba(255,170,0,0.2)',
  },
  cardCostUnaffordable: {
    fontSize: 11,
    color: '#885500',
    fontWeight: 'bold',
  },
  cardEffect: {
    fontSize: 10,
    color: COLORS.blue,
  },
  cardEffectDetail: {
    fontSize: 9,
    color: 'rgba(0,204,255,0.6)',
    marginTop: 2,
  },
  cardPct: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.5)',
  },
  buyBtn: {
    background: 'rgba(51,255,51,0.12)',
    border: `1px solid ${COLORS.green}`,
    color: COLORS.green,
    fontFamily: 'monospace',
    fontSize: 9,
    padding: '3px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: 1,
    transition: 'all 0.15s ease',
    textShadow: '0 0 4px rgba(51,255,51,0.3)',
  },
  buyBtnDisabled: {
    background: 'transparent',
    borderColor: 'rgba(51,255,51,0.15)',
    color: 'rgba(51,255,51,0.2)',
    cursor: 'not-allowed',
    textShadow: 'none',
  },
  emptyMsg: {
    color: 'rgba(51,255,51,0.4)',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '16px 0',
  },
};

const Shop: React.FC = () => {
  const [tab, setTab] = useState<ShopTab>('LICENSE');

  const qsos = useGameStore((s) => s.qsos);
  const totalQsos = useGameStore((s) => s.totalQsos);
  const ownedStations = useGameStore((s) => s.stations);
  const purchasedUpgrades = useGameStore((s) => s.upgrades);
  const qsoPerSecond = useGameStore((s) => s.qsoPerSecond);
  const buyStation = useGameStore((s) => s.buyStation);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const useEventBooster = useGameStore((s) => s.useEventBooster);
  const prestigeLevel = useGameStore((s) => s.prestigeLevel);
  const prestigeMultiplier = useGameStore((s) => s.prestigeMultiplier);
  const getPrestigeCost = useGameStore((s) => s.getPrestigeCost);
  const prestige = useGameStore((s) => s.prestige);

  // License status helpers
  const hasTech = purchasedUpgrades.includes('technician_license');
  const hasGeneral = purchasedUpgrades.includes('general_license');
  const hasExtra = purchasedUpgrades.includes('extra_class_license');

  // Determine which license level the player has (0=none, 1=tech, 2=general, 3=extra)
  const licenseLevel = hasExtra ? 3 : hasGeneral ? 2 : hasTech ? 1 : 0;

  // Helper: does the player meet a given requires field?
  const meetsRequirement = (requires?: string): boolean => {
    if (!requires) return true;
    return purchasedUpgrades.includes(requires);
  };

  // Helper: should this upgrade be VISIBLE based on license gating?
  const isVisibleByLicense = (up: typeof upgrades[0]): boolean => {
    if (!up.requires) return true;
    // Check if the requires field is a license
    if (up.requires === 'technician_license') return licenseLevel >= 1;
    if (up.requires === 'general_license') return licenseLevel >= 2;
    if (up.requires === 'extra_class_license') return licenseLevel >= 3;
    // Non-license requires: show if they have the prerequisite OR if they have enough license
    // For chained items (e.g., power_10w -> power_25w), show if prereq is met
    return true; // always show non-license-gated items
  };

  // Determine visible tabs based on license level
  const visibleTabs = useMemo(() => {
    if (licenseLevel === 0) {
      // Unlicensed: hide BAND, MODE, AMP, ACT
      return ALL_TAB_DEFS.filter(t =>
        !['BANDS', 'MODES', 'AMPS', 'ACTIVITIES'].includes(t.key)
      );
    }
    // Licensed: show all tabs
    return ALL_TAB_DEFS;
  }, [licenseLevel]);

  // If current tab is now hidden, reset to LICENSE
  const effectiveTab = visibleTabs.some(t => t.key === tab) ? tab : 'LICENSE';

  // Compute grid columns based on visible tab count
  const tabColumns = Math.min(visibleTabs.length, 6);

  // Filter upgrades by category, excluding already purchased, with license visibility
  const getUpgradesByCategory = (category: string) =>
    upgrades
      .filter((up) => up.category === category)
      .filter((up) => !purchasedUpgrades.includes(up.id))
      .filter(isVisibleByLicense)
      .sort((a, b) => a.cost - b.cost);

  // Get ALL stations sorted by tier
  const allStationsSorted = [...stations].sort((a, b) => a.tier - b.tier);

  // Filter stations by license visibility
  const getVisibleStations = () => {
    if (licenseLevel === 0) {
      // Unlicensed: only handheld and mobile_rig
      return allStationsSorted.filter(st => !st.requiredLicense);
    }
    // Licensed: filter by license gating
    return allStationsSorted.filter(st => {
      if (!st.requiredLicense) return true;
      if (st.requiredLicense === 'general_license') return licenseLevel >= 2;
      if (st.requiredLicense === 'extra_class_license') return licenseLevel >= 3;
      if (st.requiredLicense === 'technician_license') return licenseLevel >= 1;
      return true;
    });
  };

  // Events are re-purchasable, don't filter out purchased
  const getVisibleEvents = () => {
    const allEvents = upgrades
      .filter((up) => up.category === 'event')
      .sort((a, b) => a.cost - b.cost);

    if (licenseLevel === 0) {
      return allEvents.filter(up => UNLICENSED_EVENT_IDS.has(up.id));
    }
    return allEvents.filter(isVisibleByLicense);
  };

  // Get gear items filtered by license
  const getVisibleGear = () => {
    const allGear = upgrades
      .filter((up) => up.category === 'equipment')
      .filter((up) => !purchasedUpgrades.includes(up.id))
      .sort((a, b) => a.cost - b.cost);

    if (licenseLevel === 0) {
      return allGear.filter(up => UNLICENSED_GEAR_IDS.has(up.id));
    }
    return allGear.filter(isVisibleByLicense);
  };

  // Get antenna items filtered by license
  const getVisibleAntennas = () => {
    const allAntennas = upgrades
      .filter((up) => up.category === 'antenna')
      .filter((up) => !purchasedUpgrades.includes(up.id))
      .sort((a, b) => a.cost - b.cost);

    if (licenseLevel === 0) {
      return allAntennas.filter(up => UNLICENSED_ANTENNA_IDS.has(up.id));
    }
    return allAntennas.filter(isVisibleByLicense);
  };

  // License tab data
  const LICENSE_ITEMS = [
    {
      id: 'technician_license',
      level: 0,
      unlocks: 'VHF/UHF bands, 2m/70cm/6m/10m, repeater access, basic modes',
    },
    {
      id: 'general_license',
      level: 1,
      unlocks: 'Most HF bands (20m, 40m, 80m, 15m, etc.), POTA/SOTA activities',
    },
    {
      id: 'extra_class_license',
      level: 2,
      unlocks: 'Full band privileges, DXpeditions, remote stations, moonbounce',
    },
  ];

  const renderStationCard = (st: typeof stations[0]) => {
    const owned = ownedStations[st.id] ?? 0;
    const cost = getStationCost(st, owned, totalQsos);
    const isUnlocked = totalQsos >= st.unlockAt;
    const hasLicense = !st.requiredLicense || purchasedUpgrades.includes(st.requiredLicense);
    const isLocked = !isUnlocked || !hasLicense;
    const canAfford = qsos >= cost && !isLocked;
    const licenseName = st.requiredLicense
      ? UPGRADES.find((u) => u.id === st.requiredLicense)?.name ?? st.requiredLicense
      : '';

    // Build the lock reason text
    let lockReason = '';
    if (!isUnlocked) {
      lockReason = `Req: ${formatNumber(st.unlockAt)} total QSOs`;
    } else if (!hasLicense) {
      lockReason = `Req: ${licenseName}`;
    }

    const totalQps = owned > 0 ? +(st.baseQps * owned).toFixed(1) : 0;
    const pct = qsoPerSecond > 0 && totalQps > 0 ? ((totalQps / qsoPerSecond) * 100).toFixed(0) : null;
    const nextTotalQps = +((owned + 1) * st.baseQps).toFixed(1);

    return (
      <div
        key={st.id}
        className={`shop-card${isLocked ? ' shop-card-locked shop-card-disabled' : !canAfford ? ' shop-card-disabled' : ''}`}
        style={{
          ...styles.card,
          ...(isLocked
            ? styles.cardLocked
            : canAfford
              ? styles.cardAffordable
              : styles.cardDisabled),
        }}
        onClick={() => canAfford && buyStation(st.id)}
      >
        <div style={styles.cardHeader}>
          <span style={styles.cardIcon}>{isLocked ? '\u{1F512}' : st.icon}</span>
          <span style={styles.cardName}>{st.name}</span>
          {owned > 0 && (
            <span style={styles.cardCount}>x{owned}</span>
          )}
          {pct && (
            <span style={styles.cardPct}>{pct}%</span>
          )}
        </div>
        <div style={styles.cardFlavor}>{st.flavor}</div>
        <div style={styles.cardFooter}>
          <span style={canAfford ? styles.cardCost : styles.cardCostUnaffordable}>
            {formatNumber(cost)} QSOs
          </span>
          <span style={styles.cardEffect}>
            +{st.baseQps} q/s
          </span>
          {isLocked ? (
            <span style={{
              fontSize: 9,
              color: COLORS.red,
              fontWeight: 'bold',
            }}>
              {lockReason}
            </span>
          ) : (
            <button
              className="shop-buy-btn"
              style={{
                ...styles.buyBtn,
                ...(!canAfford ? styles.buyBtnDisabled : {}),
              }}
              disabled={!canAfford}
              onClick={(e) => {
                e.stopPropagation();
                if (canAfford) buyStation(st.id);
              }}
            >
              BUY
            </button>
          )}
        </div>
        {owned > 0 && (
          <div style={styles.cardEffectDetail}>
            Currently: {totalQps} q/s total | Next: {nextTotalQps} q/s
          </div>
        )}
      </div>
    );
  };

  const renderUpgradeCard = (up: typeof upgrades[0], isEvent = false) => {
    const prereqMet = !up.requires || purchasedUpgrades.includes(up.requires);
    const canAfford = qsos >= up.cost && prereqMet;
    const requiresName = up.requires
      ? UPGRADES.find((u) => u.id === up.requires)?.name ?? up.requires
      : '';

    return (
      <div
        key={up.id + (isEvent ? '-event' : '')}
        className={`shop-card${!prereqMet ? ' shop-card-locked shop-card-disabled' : !canAfford ? ' shop-card-disabled' : ''}`}
        style={{
          ...styles.card,
          ...(!prereqMet
            ? styles.cardLocked
            : canAfford
              ? styles.cardAffordable
              : styles.cardDisabled),
        }}
        onClick={() => {
          if (!canAfford) return;
          if (isEvent) {
            useEventBooster(up.id);
          } else {
            buyUpgrade(up.id);
          }
        }}
      >
        <div style={styles.cardHeader}>
          <span style={styles.cardIcon}>{prereqMet ? up.icon : '\u{1F512}'}</span>
          <span style={styles.cardName}>{up.name}</span>
        </div>
        <div style={styles.cardFlavor}>{up.flavor}</div>
        <div style={{
          fontSize: 10,
          color: COLORS.blue,
          marginBottom: 4,
          padding: '2px 4px',
          background: 'rgba(0,204,255,0.05)',
          borderRadius: 2,
          borderLeft: '2px solid rgba(0,204,255,0.2)',
        }}>
          {up.description}
        </div>
        <div style={styles.cardFooter}>
          <span style={canAfford ? styles.cardCost : styles.cardCostUnaffordable}>
            {formatNumber(up.cost)} QSOs
          </span>
          {!prereqMet ? (
            <span style={{
              fontSize: 9,
              color: COLORS.red,
              fontWeight: 'bold',
            }}>
              Req: {requiresName}
            </span>
          ) : (
            <button
              className="shop-buy-btn"
              style={{
                ...styles.buyBtn,
                ...(!canAfford ? styles.buyBtnDisabled : {}),
              }}
              disabled={!canAfford}
              onClick={(e) => {
                e.stopPropagation();
                if (!canAfford) return;
                if (isEvent) {
                  useEventBooster(up.id);
                } else {
                  buyUpgrade(up.id);
                }
              }}
            >
              {isEvent ? 'USE' : 'BUY'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderLicenseCard = (licenseInfo: typeof LICENSE_ITEMS[0]) => {
    const upDef = UPGRADES.find(u => u.id === licenseInfo.id)!;
    const isPurchased = purchasedUpgrades.includes(licenseInfo.id);
    const prereqMet = !upDef.requires || purchasedUpgrades.includes(upDef.requires);
    const canAfford = qsos >= upDef.cost && prereqMet && !isPurchased;

    // Determine lock state for display
    const isLocked = !prereqMet && !isPurchased;
    const requiresName = upDef.requires
      ? UPGRADES.find((u) => u.id === upDef.requires)?.name ?? upDef.requires
      : '';

    return (
      <div
        key={upDef.id}
        className={`shop-card${isPurchased ? '' : isLocked ? ' shop-card-locked shop-card-disabled' : !canAfford ? ' shop-card-disabled' : ''}`}
        style={{
          ...styles.card,
          ...(isPurchased
            ? {
                borderColor: 'rgba(51,255,51,0.5)',
                background: 'rgba(51,255,51,0.08)',
              }
            : isLocked
              ? styles.cardLocked
              : canAfford
                ? styles.cardAffordable
                : styles.cardDisabled),
        }}
        onClick={() => {
          if (canAfford) buyUpgrade(upDef.id);
        }}
      >
        <div style={styles.cardHeader}>
          <span style={styles.cardIcon}>
            {isPurchased ? '\u2705' : isLocked ? '\u{1F512}' : upDef.icon}
          </span>
          <span style={{
            ...styles.cardName,
            color: isPurchased ? COLORS.green : isLocked ? COLORS.red : COLORS.green,
          }}>
            {upDef.name}
          </span>
          {isPurchased && (
            <span style={{
              fontSize: 9,
              color: COLORS.green,
              fontWeight: 'bold',
              background: 'rgba(51,255,51,0.15)',
              padding: '1px 6px',
              borderRadius: 3,
            }}>
              ACTIVE
            </span>
          )}
        </div>

        <div style={styles.cardFlavor}>{upDef.flavor}</div>

        {/* Effect description */}
        <div style={{
          fontSize: 10,
          color: COLORS.blue,
          marginBottom: 4,
          padding: '2px 4px',
          background: 'rgba(0,204,255,0.05)',
          borderRadius: 2,
          borderLeft: '2px solid rgba(0,204,255,0.2)',
        }}>
          {upDef.description}
        </div>

        {/* What this license unlocks */}
        <div style={{
          fontSize: 9,
          color: COLORS.amber,
          marginBottom: 4,
          padding: '3px 6px',
          background: 'rgba(255,170,0,0.05)',
          borderRadius: 2,
          borderLeft: '2px solid rgba(255,170,0,0.2)',
          lineHeight: 1.4,
        }}>
          Unlocks: {licenseInfo.unlocks}
        </div>

        <div style={styles.cardFooter}>
          {isPurchased ? (
            <span style={{
              fontSize: 11,
              color: COLORS.green,
              fontWeight: 'bold',
            }}>
              PURCHASED
            </span>
          ) : (
            <span style={canAfford ? styles.cardCost : styles.cardCostUnaffordable}>
              {formatNumber(upDef.cost)} QSOs
            </span>
          )}
          {!isPurchased && isLocked ? (
            <span style={{
              fontSize: 9,
              color: COLORS.red,
              fontWeight: 'bold',
            }}>
              Req: {requiresName}
            </span>
          ) : !isPurchased ? (
            <button
              className="shop-buy-btn"
              style={{
                ...styles.buyBtn,
                ...(!canAfford ? styles.buyBtnDisabled : {}),
              }}
              disabled={!canAfford}
              onClick={(e) => {
                e.stopPropagation();
                if (canAfford) buyUpgrade(upDef.id);
              }}
            >
              BUY
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (effectiveTab) {
      case 'LICENSE': {
        return (
          <>
            {/* License status header */}
            <div style={{
              padding: '8px 10px',
              marginBottom: 6,
              border: '1px solid rgba(255,170,0,0.2)',
              borderRadius: 4,
              background: 'rgba(255,170,0,0.03)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 11,
                color: COLORS.amber,
                fontWeight: 'bold',
                marginBottom: 2,
              }}>
                LICENSE STATUS
              </div>
              <div style={{
                fontSize: 10,
                color: licenseLevel === 0 ? COLORS.red : COLORS.green,
              }}>
                {licenseLevel === 0 && 'UNLICENSED — Get your Technician License to start transmitting!'}
                {licenseLevel === 1 && 'TECHNICIAN — VHF/UHF privileges active'}
                {licenseLevel === 2 && 'GENERAL — HF privileges active'}
                {licenseLevel === 3 && 'EXTRA CLASS — Full privileges active'}
              </div>
            </div>
            {LICENSE_ITEMS.map(li => renderLicenseCard(li))}
          </>
        );
      }

      case 'RADIOS': {
        const visStations = getVisibleStations();
        return (
          <>
            {visStations.map(renderStationCard)}
          </>
        );
      }

      case 'ANTENNAS': {
        const items = getVisibleAntennas();
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No antennas available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up))
        );
      }

      case 'AMPS': {
        const items = getUpgradesByCategory('amp');
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No amps available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up))
        );
      }

      case 'MODES': {
        const items = getUpgradesByCategory('mode');
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No modes available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up))
        );
      }

      case 'BANDS': {
        const items = getUpgradesByCategory('band');
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No bands available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up))
        );
      }

      case 'GEAR': {
        const items = getVisibleGear();
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No gear available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up))
        );
      }

      case 'ACTIVITIES': {
        const items = getUpgradesByCategory('activity');
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No activities available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up))
        );
      }

      case 'EVENTS': {
        const items = getVisibleEvents();
        return items.length === 0 ? (
          <div style={styles.emptyMsg}>No events available</div>
        ) : (
          items.map((up) => renderUpgradeCard(up, true))
        );
      }

      case 'AWARDS':
        return <Achievements />;

      case 'RESEARCH':
        return <ResearchPanel />;

      case 'PRESTIGE': {
        const cost = getPrestigeCost();
        const canPrestige = totalQsos >= cost;
        const nextMultiplier = 1 + ((prestigeLevel + 1) * 0.5);

        return (
          <div style={{ padding: '12px 4px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Current Level */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#ffd700',
                textShadow: '0 0 12px rgba(255,215,0,0.5)',
                fontFamily: 'monospace',
              }}>
                PRESTIGE {prestigeLevel}
              </div>
              <div style={{
                fontSize: 14,
                color: COLORS.amber,
                marginTop: 4,
                fontFamily: 'monospace',
              }}>
                Current Multiplier: {prestigeMultiplier.toFixed(1)}x
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(255,215,0,0.2)', margin: '0 8px' }} />

            {/* Next Prestige Info */}
            <div style={{
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 4,
              padding: '10px 12px',
              background: 'rgba(255,215,0,0.03)',
            }}>
              <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 'bold', marginBottom: 6 }}>
                NEXT PRESTIGE: Level {prestigeLevel + 1}
              </div>
              <div style={{ fontSize: 10, color: COLORS.amber, marginBottom: 4 }}>
                Cost: {formatNumber(cost)} total QSOs
              </div>
              <div style={{ fontSize: 10, color: COLORS.amber, marginBottom: 4 }}>
                You have: {formatNumber(totalQsos)} total QSOs
              </div>
              <div style={{ fontSize: 10, color: COLORS.blue }}>
                New multiplier: {nextMultiplier.toFixed(1)}x (currently {prestigeMultiplier.toFixed(1)}x)
              </div>
            </div>

            {/* Warning */}
            <div style={{
              border: '1px solid rgba(255,68,68,0.3)',
              borderRadius: 4,
              padding: '8px 10px',
              background: 'rgba(255,68,68,0.03)',
              fontSize: 9,
              lineHeight: 1.5,
            }}>
              <div style={{ color: COLORS.red, fontWeight: 'bold', marginBottom: 4, fontSize: 10 }}>
                WARNING — PRESTIGE WILL RESET:
              </div>
              <div style={{ color: 'rgba(255,68,68,0.7)' }}>
                Current QSOs, all stations, non-license upgrades, SWR state, power level, active events
              </div>
              <div style={{ color: COLORS.green, fontWeight: 'bold', marginTop: 6, fontSize: 10 }}>
                YOU KEEP:
              </div>
              <div style={{ color: 'rgba(51,255,51,0.7)' }}>
                Prestige level + multiplier, total QSOs, achievements, licenses (Tech/General/Extra)
              </div>
            </div>

            {/* Prestige Button */}
            <button
              disabled={!canPrestige}
              style={{
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                letterSpacing: 2,
                border: `2px solid ${canPrestige ? '#ffd700' : 'rgba(255,215,0,0.2)'}`,
                borderRadius: 6,
                background: canPrestige ? 'rgba(255,215,0,0.15)' : 'transparent',
                color: canPrestige ? '#ffd700' : 'rgba(255,215,0,0.25)',
                cursor: canPrestige ? 'pointer' : 'not-allowed',
                textShadow: canPrestige ? '0 0 8px rgba(255,215,0,0.4)' : 'none',
                boxShadow: canPrestige ? '0 0 16px rgba(255,215,0,0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                if (!canPrestige) return;
                const confirmed = window.confirm(
                  `PRESTIGE to Level ${prestigeLevel + 1}?\n\n` +
                  `This will reset your current QSOs, stations, and most upgrades.\n\n` +
                  `You KEEP: licenses, achievements, total QSOs, and your new ${nextMultiplier.toFixed(1)}x multiplier.\n\n` +
                  `This cannot be undone!`
                );
                if (confirmed) prestige();
              }}
            >
              PRESTIGE NOW
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .shop-card:hover:not(.shop-card-disabled) {
          box-shadow: 0 0 12px rgba(51,255,51,0.15), inset 0 0 20px rgba(51,255,51,0.03) !important;
          border-color: rgba(51,255,51,0.5) !important;
        }
        .shop-card-locked:hover {
          box-shadow: none !important;
          border-color: rgba(255,68,68,0.2) !important;
        }
        .shop-buy-btn:hover:not(:disabled) {
          background: rgba(51,255,51,0.2) !important;
          box-shadow: 0 0 8px rgba(51,255,51,0.25);
        }
      `}</style>

      <div style={styles.title}>
        SHOP
        <span style={styles.titleLabel}>// EQUIPMENT RACK</span>
      </div>

      {/* Tab Toggle — dynamically sized grid */}
      <div className="shop-tab-row" style={{
        ...styles.tabRow,
        gridTemplateColumns: `repeat(${tabColumns}, 1fr)`,
      }}>
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            style={{
              ...styles.tab,
              ...(effectiveTab === t.key ? styles.tabActive : {}),
              ...(t.key === 'LICENSE' && effectiveTab !== 'LICENSE' ? {
                color: 'rgba(255,170,0,0.5)',
                borderColor: 'rgba(255,170,0,0.3)',
              } : {}),
              ...(t.key === 'LICENSE' && effectiveTab === 'LICENSE' ? {
                background: COLORS.amber,
                color: '#0a0e1a',
                border: `1px solid ${COLORS.amber}`,
              } : {}),
              ...(t.key === 'RESEARCH' ? {
                color: effectiveTab === 'RESEARCH' ? '#0a0e1a' : 'rgba(0,204,255,0.4)',
                borderColor: effectiveTab === 'RESEARCH' ? '#00ccff' : 'rgba(0,204,255,0.2)',
                background: effectiveTab === 'RESEARCH' ? '#00ccff' : 'rgba(8,16,24,0.9)',
                boxShadow: 'none',
              } : {}),
              ...(t.key === 'PRESTIGE' ? {
                color: effectiveTab === 'PRESTIGE' ? '#0a0e1a' : 'rgba(255,215,0,0.4)',
                borderColor: effectiveTab === 'PRESTIGE' ? '#ffd700' : 'rgba(255,215,0,0.2)',
                background: effectiveTab === 'PRESTIGE' ? '#ffd700' : 'rgba(8,16,24,0.9)',
                boxShadow: 'none',
              } : {}),
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={styles.list}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Shop;
